import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default withApiAuthRequired(async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);

    // Set up mongo db connection to collection
    const client = await clientPromise;
    const db = client.db("BlogStandard");

    // Find current user in mongo db collection
    const currentUser = await db.collection("users").findOne({
      auth0Id: user.sub,
    });

    const { postId } = req.body;

    await db.collection("posts").deleteOne({
      userId: currentUser._id,
      _id: new ObjectId(postId),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("ERROR TRYING TO DELETE A POST", error);
  }
  return;
});
