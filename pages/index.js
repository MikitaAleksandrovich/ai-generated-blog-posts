import Image from "next/image";
import Link from "next/link";
import HeroImage from "../public/hero.webp";
import { Logo } from "../components/Logo";

const featuredPosts = [
  {
    title: "Harnessing AI to Accelerate Your Content Strategy",
    excerpt:
      "Discover practical frameworks for brainstorming, outlining, and optimizing long-form blog posts with the help of AI copilots.",
    readTime: "6 min read",
    category: "AI Content",
  },
  {
    title: "SEO Workflows That Keep Your Editorial Calendar Full",
    excerpt:
      "From keyword clustering to internal linking checklists, learn the repeatable systems that top growth teams rely on.",
    readTime: "8 min read",
    category: "SEO Strategy",
  },
  {
    title: "Designing Blog Posts Readers Actually Finish",
    excerpt:
      "Structure your posts for skimmability, add value-dense visuals, and keep readers engaged from intro to CTA.",
    readTime: "5 min read",
    category: "Content UX",
  },
];

export default function Home() {
  return (
    <div className="w-screen min-h-screen overflow-hidden flex justify-center items-center relative">
      <Image src={HeroImage} alt="Hero" fill className="absolute " />
      <div className="relative z-10 w-full max-w-4xl px-6 py-10 flex flex-col gap-6">
        <div className="text-white px-10 py-5 text-center bg-slate-900/90 rounded-md backdrop-blur-sm">
          <Logo />
          <p>
            The AI-powered SAAS solution to generate SEO-optimized blog posts in
            minutes. Get hight-quality content, without sacrificing your time.
          </p>
          <Link href="/post/new" className="btn mt-4">
            Begin
          </Link>
        </div>
        <div className="bg-white/90 rounded-md p-6 backdrop-blur-sm shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 text-center">
            Latest from the Blog
          </h2>
          <div className="mt-6 space-y-4">
            {featuredPosts.map((post) => (
              <article
                key={post.title}
                className="p-4 rounded-md border border-slate-200 bg-white/80"
              >
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {post.category}
                </div>
                <h3 className="text-xl text-slate-900">{post.title}</h3>
                <p className="text-slate-600">{post.excerpt}</p>
                <div className="text-sm text-slate-500 mt-2">
                  {post.readTime}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}