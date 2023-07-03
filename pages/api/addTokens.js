import clientPromise from "../../lib/mongodb";
import { getSession } from "@auth0/nextjs-auth0";

export const handler = async (req, res) => {
  const { user } = await getSession(req, res);

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

  res.status(200).json({ name: "John Doe" });
};

export default handler;
