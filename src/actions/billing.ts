"use server";

import { redirect } from "next/navigation";
import { stripe, STRIPE_PRICE_IDS, type BillingInterval } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "./_utils";

export async function createCheckoutSession(interval: BillingInterval) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.error;

  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
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
      where: { id: authResult.userId },
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
    metadata: { userId: authResult.userId },
    subscription_data: {
      metadata: { userId: authResult.userId },
    },
  });

  if (!checkoutSession.url) {
    return { success: false, error: "Failed to create checkout session" } as const;
  }

  redirect(checkoutSession.url);
}

export async function createBillingPortalSession() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.error;

  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
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
