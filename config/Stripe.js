import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_API, {
  apiVersion: "2022-11-15",
});

export default stripe;
