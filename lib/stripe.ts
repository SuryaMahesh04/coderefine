import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = new Stripe(stripeSecretKey || "sk_test_dummy", {
  // @ts-ignore
  apiVersion: "2024-04-10",
  appInfo: {
    name: "Loom AI",
    version: "1.0.0",
  },
});

if (!stripeSecretKey && process.env.NODE_ENV === "production") {
  console.warn("WARNING: STRIPE_SECRET_KEY is missing in production environment.");
}
