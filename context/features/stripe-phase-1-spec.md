# Stripe Integration — Phase 1: Core Infrastructure

## Overview

Install Stripe, wire it into the session/JWT layer, create the server-side singleton and billing server actions, and extract a `usage-limits` module with full unit test coverage. Phase 1 has no dependency on the Stripe CLI or live webhooks — it can be built and tested with Stripe test-mode keys alone.

## Goals

- Install `stripe` and `@stripe/stripe-js` packages
- Create `src/lib/stripe.ts` singleton
- Extend session types and JWT callback to carry `isPro`
- Create `src/actions/billing.ts` with `createCheckoutSession` and `createBillingPortalSession`
- Create `src/lib/usage-limits.ts` with free-tier limit constants and helpers
- Write unit tests for `usage-limits.ts`
- Update `src/lib/db/profile.ts` to include `isPro`
- Add `NEXT_PUBLIC_APP_URL` to `.env.example`

## Files to Create

### `src/lib/stripe.ts`

Stripe server-side singleton (same singleton pattern as `src/lib/prisma.ts`):

```typescript
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
});

export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
} as const;

export type BillingInterval = keyof typeof STRIPE_PRICE_IDS;
```

---

### `src/lib/usage-limits.ts`

Free-tier limit constants and pure helper functions. No Prisma imports — helpers take counts as arguments so they are trivially unit-testable.

```typescript
export const FREE_LIMITS = {
  items: 50,
  collections: 3,
} as const;

export const PRO_ONLY_TYPES = new Set(["file", "image"]);

export function isAtItemLimit(count: number): boolean {
  return count >= FREE_LIMITS.items;
}

export function isAtCollectionLimit(count: number): boolean {
  return count >= FREE_LIMITS.collections;
}

export function isProOnlyType(typeName: string): boolean {
  return PRO_ONLY_TYPES.has(typeName);
}
```

---

### `src/lib/usage-limits.test.ts`

Unit tests (no mocks needed — all pure functions):

- `isAtItemLimit(49)` → `false`
- `isAtItemLimit(50)` → `true`
- `isAtItemLimit(51)` → `true`
- `isAtCollectionLimit(2)` → `false`
- `isAtCollectionLimit(3)` → `true`
- `isProOnlyType("file")` → `true`
- `isProOnlyType("image")` → `true`
- `isProOnlyType("snippet")` → `false`
- `FREE_LIMITS.items` equals `50`
- `FREE_LIMITS.collections` equals `3`

---

### `src/actions/billing.ts`

Two server actions: start checkout and open billing portal.

```typescript
"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { stripe, STRIPE_PRICE_IDS, type BillingInterval } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function createCheckoutSession(interval: BillingInterval) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" } as const;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true },
  });

  if (!user) {
    return { success: false, error: "User not found" } as const;
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email! });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: STRIPE_PRICE_IDS[interval], quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?checkout=cancelled`,
    subscription_data: {
      metadata: { userId: session.user.id },
    },
  });

  if (!checkoutSession.url) {
    return { success: false, error: "Failed to create checkout session" } as const;
  }

  redirect(checkoutSession.url);
}

export async function createBillingPortalSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" } as const;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return { success: false, error: "No billing account found" } as const;
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  redirect(portalSession.url);
}
```

## Files to Modify

### `src/types/next-auth.d.ts`

Add `isPro: boolean` to the session user type:

```typescript
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPro: boolean;
    } & DefaultSession["user"];
  }
}
```

---

### `src/auth.ts` — JWT + session callbacks

Replace the existing `jwt` callback to sync `isPro` from the database on every token validation. Replace the existing `session` callback to pass `isPro` through:

```typescript
jwt: async ({ token, user }) => {
  if (user) {
    token.id = user.id;
    token.name = user.name;
    token.email = user.email;
    token.picture = user.image;
  }

  if (token.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { isPro: true },
    });
    token.isPro = dbUser?.isPro ?? false;
  }

  return token;
},

session: async ({ session, token }) => {
  session.user.id = token.id as string;
  session.user.isPro = (token.isPro as boolean) ?? false;
  session.user.name = token.name ?? null;
  session.user.email = token.email ?? "";
  session.user.image = (token.picture as string | null) ?? null;
  return session;
},
```

---

### `src/lib/db/profile.ts`

Add `isPro` to the user select, `ProfileData` type, and the returned object:

```typescript
// Add to select:
isPro: true,

// Add to ProfileData type:
isPro: boolean;

// Add to returned object:
isPro: user.isPro,
```

---

### `.env.example`

Add:

```
# App URL (used in Stripe redirect URLs)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Environment Variables

All Stripe keys are already declared in `.env.example`. Add to `.env.local`:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...        # from Stripe CLI for local dev
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Stripe Dashboard Setup (one-time, before coding)

1. Create product "DevStash Pro" with two recurring prices:
   - Monthly: $8.00 USD/month → copy ID → `STRIPE_PRICE_ID_MONTHLY`
   - Yearly: $72.00 USD/year → copy ID → `STRIPE_PRICE_ID_YEARLY`
2. API keys: Developers → API keys → copy secret + publishable keys
3. Enable Customer Portal: Settings → Billing → Customer portal

## Testing

Run `npm test` after implementation — `src/lib/usage-limits.test.ts` must pass with 10 tests. All existing tests must continue to pass.

No Stripe CLI or live checkout required for Phase 1.

## Notes

- `src/lib/usage-limits.ts` is intentionally free of Prisma/auth imports — keeps it pure and trivially testable.
- The JWT `isPro` sync costs one extra DB read per request but guarantees the session reflects webhook changes after a simple page reload. Acceptable trade-off for this scale.
- Do NOT gate features yet — gating is Phase 2. Phase 1 only wires the infrastructure.
