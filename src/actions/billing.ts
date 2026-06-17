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
