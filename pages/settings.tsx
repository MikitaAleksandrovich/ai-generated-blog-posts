import Head from "next/head";

export default function Settings() {
  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <div className="p-8">
        <h1 className="text-3xl font-semibold mb-4">Settings</h1>
        <p className="text-gray-600">
          Customize your experience by updating your account preferences here.
        </p>
      </div>
    </>
  );
}