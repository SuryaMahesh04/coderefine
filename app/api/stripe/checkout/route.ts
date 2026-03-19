import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { stripe } from "../../../../lib/stripe";
import connectDB from "../../../../lib/mongoose";
import { User } from "../../../../lib/models/User";

const PLAN_PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID, // Add these to .env.local
  team: process.env.STRIPE_TEAM_PRICE_ID,
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body;

    const priceId = PLAN_PRICE_IDS[plan as keyof typeof PLAN_PRICE_IDS];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    await connectDB();
    const dbUser = await User.findById((session.user as any).id);

    if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      customer_email: dbUser.stripeCustomerId ? undefined : dbUser.email,
      customer: dbUser.stripeCustomerId || undefined,
      client_reference_id: dbUser._id.toString(), // To identify user in webhook
      metadata: {
        userId: dbUser._id.toString(),
        plan: plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
