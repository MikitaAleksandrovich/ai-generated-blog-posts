import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import { useState } from "react";

export default function NewPost() {
  const [postContent, setPostContent] = useState("");
  const handleGeneratePost = async () => {
    const response = await fetch("/api/generatePost", {
      method: "POST",
    });

    const json = await response.json();
    console.log("result", json.post.postContent);
    setPostContent(json.post.postContent);
  };

  return (
    <div>
      <h1>This is new post page</h1>
      <button className="btn" onClick={handleGeneratePost}>
        Generate
      </button>
      <div
        className="msx-w-screen-sm p-10"
        dangerouslySetInnerHTML={{ __html: postContent }}
      />
    </div>
  );
}

NewPost.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired(() => {
  return {
    props: {},
  };
});
