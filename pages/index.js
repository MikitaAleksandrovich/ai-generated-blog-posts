import Image from "next/image";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import HeroImage from "../public/hero.webp";
import { Logo } from "../components/Logo";

export default function Home() {
  const { user, isLoading } = useUser();

  return (
    <div className="w-screen h-screen overflow-hidden flex justify-center items-center relative">
      <Image src=HeroImage alt="Hero" fill className="absolute " />
      <div className="relative z-10 text-white px-10 py-5 text-center max-w-screen-sm bg-slate-900/90 rounded-md backdrop-blur-sm">
        <Logo />
        <p>
          The AI-powered SAAS solution to generate SEO-optimized blog posts in
          minutes. Get hight-quality content, without sacrificing your time.
        </p>
        {isLoading && (
          <p className="mt-6 text-sm text-slate-200">Checking your session...</p>
        )}
        {!isLoading && (
          <>
            {user ? (
              <>
                <div className="mt-6">
                  <p className="text-lg font-semibold">
                    Welcome back, {user.name || user.nickname || "creator"}!
                  </p>
                  {user.email && (
                    <p className="text-sm text-slate-200">{user.email}</p>
                  )}
                </div>
                <Link href="/post/new" className="btn mt-4">
                  Go to dashboard
                </Link>
                <Link
                  href="/api/auth/logout"
                  className="btn mt-2 bg-slate-600 hover:bg-slate-500"
                >
                  Logout
                </Link>
              </>
            ) : (
              <>
                <p className="mt-6 text-sm text-slate-200">
                  Sign in to start generating blog posts instantly.
                </p>
                <Link href="/api/auth/login" className="btn mt-4">
                  Login with Auth0
                </Link>
                <Link
                  href="/api/auth/appleMock"
                  className="btn mt-2 bg-black hover:bg-black/80"
                >
                  Continue with Apple (Mock)
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}