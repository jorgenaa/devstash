# Stripe Integration — Phase 2: Webhooks, Gating & UI

## Overview

Wire Stripe webhooks to keep `isPro` in sync, enforce free-tier limits server-side in actions and the upload API, and add the billing UI to the settings page. Requires Phase 1 to be complete and the Stripe CLI running locally for webhook testing.

## Goals

- Create webhook handler at `POST /api/webhooks/stripe`
- Gate `createItem` (50-item limit, Pro-only file/image types)
- Gate `createCollection` (3-collection limit)
- Gate `POST /api/upload` (Pro-only)
- Add `BillingSection` component to the settings page
- Add `UpgradePrompt` component for inline limit warnings
- Update the settings page to show checkout success/cancelled toast
- Verify end-to-end with the Stripe CLI

## Prerequisites

- Phase 1 complete (`src/lib/stripe.ts`, `src/lib/usage-limits.ts`, `src/actions/billing.ts`, `isPro` in session)
- Stripe CLI installed: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- `.env.local` has `STRIPE_WEBHOOK_SECRET` set to the CLI-provided `whsec_...`

## Files to Create

### `src/app/api/webhooks/stripe/route.ts`

Processes three events to keep `isPro` and `stripeSubscriptionId` in sync. Uses `request.text()` to preserve the raw body required for signature verification.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = session.subscription_data?.metadata?.userId;
        if (!userId) break;

        await prisma.user.update({
          where: { id: userId },
          data: {
            isPro: true,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const isActive = sub.status === "active" || sub.status === "trialing";

        await prisma.user.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { isPro: isActive },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        await prisma.user.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            isPro: false,
            stripeSubscriptionId: null,
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

export const config = {
  api: { bodyParser: false },
};
```

---

### `src/components/billing/BillingSection.tsx`

Client component for the settings page billing card. Shows "Active" state for Pro users (with Manage Billing button) and an upgrade flow for free users (monthly/yearly toggle + feature list + Upgrade button).

```typescript
"use client";

import { useState } from "react";
import { Crown, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createCheckoutSession, createBillingPortalSession } from "@/actions/billing";

type Props = { isPro: boolean };

export function BillingSection({ isPro }: Props) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    await createCheckoutSession(interval);
    setLoading(false);
  }

  async function handlePortal() {
    setLoading(true);
    await createBillingPortalSession();
    setLoading(false);
  }

  if (isPro) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-yellow-500" />
          <span className="text-sm font-medium">DevStash Pro</span>
          <Badge variant="outline" className="text-[10px] text-yellow-500 border-yellow-500/30">
            Active
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={handlePortal} disabled={loading}>
          Manage Billing
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          variant={interval === "monthly" ? "default" : "outline"}
          size="sm"
          onClick={() => setInterval("monthly")}
        >
          Monthly — $8
        </Button>
        <Button
          variant={interval === "yearly" ? "default" : "outline"}
          size="sm"
          onClick={() => setInterval("yearly")}
        >
          Yearly — $72 <span className="ml-1 text-xs opacity-70">Save 25%</span>
        </Button>
      </div>

      <ul className="space-y-1 text-sm text-muted-foreground">
        {["Unlimited items", "Unlimited collections", "File & image uploads", "All AI features", "Data export"].map((f) => (
          <li key={f} className="flex items-center gap-2">
            <CheckCircle className="size-3.5 text-emerald-500 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <Button onClick={handleCheckout} disabled={loading} className="w-fit">
        {loading ? "Redirecting…" : "Upgrade to Pro"}
      </Button>
    </div>
  );
}
```

---

### `src/components/billing/UpgradePrompt.tsx`

Inline prompt shown at limit boundaries (e.g., when `createItem` returns the free-plan error).

```typescript
"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { message: string };

export function UpgradePrompt({ message }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm">
      <Crown className="size-4 shrink-0 text-yellow-500" />
      <span className="text-muted-foreground">{message}</span>
      <Button asChild size="sm" variant="outline" className="ml-auto shrink-0">
        <Link href="/settings#billing">Upgrade</Link>
      </Button>
    </div>
  );
}
```

## Files to Modify

### `src/actions/items.ts` — `createItem`

Add free-tier checks using helpers from `src/lib/usage-limits.ts`. Insert after the auth check and before schema parsing:

```typescript
// Free tier: 50 item limit
if (!session.user.isPro) {
  const count = await prisma.item.count({ where: { userId: session.user.id } });
  if (isAtItemLimit(count)) {
    return { success: false, error: "Free plan limit reached. Upgrade to Pro for unlimited items." };
  }
}
```

After schema parsing, add Pro-only type check:

```typescript
// File and image types are Pro-only
if (isProOnlyType(parsed.data.typeName) && !session.user.isPro) {
  return { success: false, error: "File and image uploads require Pro." };
}
```

---

### `src/actions/collections.ts` — `createCollection`

Add free-tier check using helper from `src/lib/usage-limits.ts`:

```typescript
// Free tier: 3 collection limit
if (!session.user.isPro) {
  const count = await prisma.collection.count({ where: { userId: session.user.id } });
  if (isAtCollectionLimit(count)) {
    return { success: false, error: "Free plan limit reached. Upgrade to Pro for unlimited collections." };
  }
}
```

---

### `src/app/api/upload/route.ts`

Add Pro-only check after the auth check:

```typescript
if (!session.user.isPro) {
  return NextResponse.json(
    { error: "File and image uploads require a Pro subscription." },
    { status: 403 }
  );
}
```

---

### `src/app/settings/page.tsx`

Add a Billing card with `id="billing"` before the Editor Preferences card. Pass `profile.isPro` to `BillingSection`. Also handle `?checkout=success` and `?checkout=cancelled` query params with sonner toasts (client-side — add a small `'use client'` sub-component or `useSearchParams` wrapper).

```typescript
import { BillingSection } from "@/components/billing/BillingSection";

// Add card before Editor Preferences:
<Card id="billing">
  <CardHeader>
    <CardTitle className="text-base">Plan & Billing</CardTitle>
    <CardDescription>
      {profile.isPro
        ? "You are on the Pro plan."
        : "Upgrade to unlock unlimited items, file uploads, and AI features."}
    </CardDescription>
  </CardHeader>
  <CardContent>
    <BillingSection isPro={profile.isPro} />
  </CardContent>
</Card>
```

## Testing Checklist

### Unit / Integration (`npm test`)

No new unit tests required for Phase 2 — the `createItem` and `createCollection` actions are tested in Phase 1's suite. Extend existing tests:

- `createItem` blocks at 50 items for free user (`session.user.isPro = false`, mock `prisma.item.count` returning 50)
- `createItem` allows creation for Pro user regardless of count
- `createItem` blocks `file` type for free user
- `createItem` allows `file` type for Pro user
- `createCollection` blocks at 3 collections for free user
- `createCollection` allows creation for Pro user

### Webhook (manual with Stripe CLI)

Start the Stripe CLI forwarder:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

- `checkout.session.completed` → user `isPro` becomes `true`, `stripeSubscriptionId` set
- `customer.subscription.deleted` → `isPro` becomes `false`, `stripeSubscriptionId` cleared
- `customer.subscription.updated` with `status: "past_due"` → `isPro` becomes `false`
- Send request with invalid/missing signature → returns 400

Trigger events manually:

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
```

### End-to-End (manual)

1. Sign in as a free user
2. Go to Settings → Plan & Billing → "Upgrade to Pro" → select Monthly
3. Complete Stripe test checkout with card `4242 4242 4242 4242`
4. Confirm redirect to `/settings?checkout=success` with success toast
5. Reload — billing section shows "Active" badge and "Manage Billing" button
6. Confirm can create 51+ items and upload a file
7. Run `stripe trigger customer.subscription.deleted` via CLI
8. Reload settings — reverts to free plan, upgrade UI returns

## Notes

- Enforcement is server-side only. UI warnings (`UpgradePrompt`) are additive, never the gate.
- Webhook `updateMany` by `stripeSubscriptionId` is safe to replay; Stripe may deliver the same event more than once.
- No DB migration needed — `User` already has `isPro`, `stripeCustomerId`, `stripeSubscriptionId`. Verify with `npx prisma migrate status`.
- Stripe billing portal must be enabled in the Stripe Dashboard (Settings → Billing → Customer portal) before "Manage Billing" will work.
- The `config: { api: { bodyParser: false } }` export is required to prevent Next.js from consuming the raw body before signature verification.
