import Link from "next/link";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../components/AppLayout";
import { getAppProps } from "../utils/getAppProps";

export default function Success() {
  return (
    <div>
      <h1>Thank you for your purchase!</h1>
      <p>Your additional tokens have been added to your account.</p>
      <Link href="/post/new" className="btn mt-4 max-w-xs">
        Create a new post
      </Link>
    </div>
  );
}

Success.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);
    return {
      props,
    };
  },
});