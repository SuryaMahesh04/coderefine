import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { stripe } from "../../../../lib/stripe";
import connectDB from "../../../../lib/mongoose";
import { User } from "../../../../lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const dbUser = await User.findById((session.user as any).id);

    if (!dbUser || !dbUser.stripeCustomerId) {
      return NextResponse.json({ error: "Customer not found or no active subscription" }, { status: 404 });
    }

    const { url } = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    });

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Stripe Portal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
