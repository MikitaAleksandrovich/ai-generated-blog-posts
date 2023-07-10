import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default function Post(props) {
  console.log("props", props);
  return (
    <div>
      <h1>This is the post page</h1>
    </div>
  );
}

Post.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    // Get user data
    const userSession = await getSession(ctx.req, ctx.res);

    // Set up mongo db connection to collection
    const client = await clientPromise;
    const db = client.db("BlogStandard");

    // Find current user in collection
    const user = await db.collection("users").findOne({
      auth0Id: userSession.user.sub,
    });

    // Find post by id from url
    const post = await db.collection("posts").findOne({
      _id: new ObjectId(ctx.params.postId),
      userId: user._id,
    });

    if (!post) {
      return {
        redirect: {
          destination: "/post/new",
          permanent: false,
        },
      };
    }

    return {
      props: {
        postContent: post.postContent,
        title: post.title,
        metaDescription: post.metaDescription,
        keywords: post.keywords,
      },
    };
  },
});
