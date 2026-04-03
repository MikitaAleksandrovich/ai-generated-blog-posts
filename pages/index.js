import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import HeroImage from "../public/hero.webp";
import { Logo } from "../components/Logo";
import { mockTwitterSignIn } from "../services/mockAuthService";

export default function Home() {
  const [mockProfile, setMockProfile] = useState(null);
  const [mockSignInError, setMockSignInError] = useState("");
  const [mockSignInLoading, setMockSignInLoading] = useState(false);

  const handleMockTwitterSignIn = async () => {
    setMockSignInError("");
    setMockProfile(null);
    setMockSignInLoading(true);

    try {
      const response = await mockTwitterSignIn();
      setMockProfile(response.user);
    } catch (error) {
      setMockSignInError("Mock Twitter sign-in failed. Please try again.");
    } finally {
      setMockSignInLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex justify-center items-center relative">
      <Image src={HeroImage} alt="Hero" fill className="absolute " />
      <div className="relative z-10 text-white px-10 py-5 text-center max-w-screen-sm bg-slate-900/90 rounded-md backdrop-blur-sm">
        <Logo />
        <p>
          The AI-powered SAAS solution to generate SEO-optimized blog posts in
          minutes. Get hight-quality content, without sacrificing your time.
        </p>
        <Link href="/post/new" className="btn">
          Begin
        </Link>
        <button
          type="button"
          onClick={handleMockTwitterSignIn}
          disabled={mockSignInLoading}
          className="mt-3 w-full rounded-md bg-sky-500 px-4 py-2 font-bold uppercase text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300"
        >
          {mockSignInLoading
            ? "Signing in with Mock Twitter..."
            : "Mock Twitter Sign-In"}
        </button>
        <p className="text-xs mt-2 text-slate-200">
          This mock flow is separate from real authentication and does not use
          Twitter credentials.
        </p>
        {mockProfile && (
          <div className="mt-2 text-sm bg-white/10 border border-white/20 rounded-md p-3">
            Pretending to sign in as{" "}
            <strong>{mockProfile.name}</strong> (@{mockProfile.username}).
          </div>
        )}
        {!!mockSignInError && (
          <div className="mt-2 text-sm text-red-200">{mockSignInError}</div>
        )}
      </div>
    </div>
  );
}