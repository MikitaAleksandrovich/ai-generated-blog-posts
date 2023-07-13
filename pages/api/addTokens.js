import clientPromise from "../../lib/mongodb";
import { getSession } from "@auth0/nextjs-auth0";
import stripeInit from "stripe";

// Set up stripe
const stripe = stripeInit(process.env.STRIPE_SECRET_KEY);

export const handler = async (req, res) => {
  const { user } = await getSession(req, res);

  // Set up stripe price
  const lineItems = [
    {
      price: process.env.STRIPE_PRODUCT_PRICE_ID,
      quantity: 1,
    },
  ];

  // Set up protocol based on env
  const protocol =
    process.env.NODE_ENV === "development" ? "http://" : "https://";
  const host = req.headers.host;

  // Create stripe checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: "payment",
    success_url: `${protocol}${host}/success`,
  });

  // Set up mongo db connection to collection
  const client = await clientPromise;
  const db = client.db("BlogStandard");

  // Upsert user data with tokens to db
  const userProfile = await db.collection("users").updateOne(
    {
      auth0Id: user.sub,
    },
    {
      $inc: {
        availableTokens: 10,
      },
      $setOnInsert: {
        auth0Id: user.sub,
      },
    },
    {
      upsert: true,
    }
  );

  res.status(200).json({ session: checkoutSession });
};

export default handler;
