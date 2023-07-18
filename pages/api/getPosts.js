import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";

export default withApiAuthRequired(async function handler(req, res) {
  try {
    const {
      user: { sub },
    } = await getSession(req, res);

    // Set up mongo db connection to collection
    const client = await clientPromise;
    const db = client.db("BlogStandard");

    // Find current user in mongo db collection
    const currentUser = await db.collection("users").findOne({
      auth0Id: sub,
    });

    const { lastPostDate } = req.body;

    const posts = await db
      .collection("posts")
      .find({
        userId: currentUser._id,
        created: { $lt: new Date(lastPostDate) },
      })
      .limit(5)
      .sort({ created: -1 })
      .toArray();

    res.status(200).json({ posts });

    return;
  } catch (error) {}
});
