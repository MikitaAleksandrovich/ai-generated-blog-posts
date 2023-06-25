import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";

export default function NewPost() {
  const handleGeneratePost = async () => {
    const response = await fetch("/api/generatePost", {
      method: "POST",
    });

    const json = await response.json();
    console.log("result", json);
  };

  return (
    <div>
      <h1>This is new post page</h1>
      <button className="btn" onClick={handleGeneratePost}>
        Generate
      </button>
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
