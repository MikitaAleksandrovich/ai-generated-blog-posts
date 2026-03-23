import Head from "next/head";
import AppleSignInButton from "@/components/AppleSignInButton";

export default function Home() {
  return (
    <>
      <Head>
        <title>Next.js App</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to continue to your dashboard.
          </p>

          <div className="mt-6 space-y-3">
            <AppleSignInButton label="Sign in with Apple" />
            <AppleSignInButton label="Sign up with Apple" />
          </div>
        </div>
      </main>
    </>
  );
}