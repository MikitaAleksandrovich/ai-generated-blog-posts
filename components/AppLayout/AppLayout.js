import Link from "next/link";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { Logo } from "../Logo";
import { useContext, useEffect, useState } from "react";
import PostsContext from "../../context/postContext";
import { mockTwitterSignIn } from "../../services/mockAuthService";

export const AppLayout = ({
  children,
  availableTokens,
  posts: postsFromSSR,
  postId,
  postCreated,
}) => {
  const { user } = useUser();

  const { setPostsFromSSR, posts, getPosts, noMorePosts } =
    useContext(PostsContext);
  const [mockAuthMessage, setMockAuthMessage] = useState(null);
  const [isMockAuthLoading, setIsMockAuthLoading] = useState(false);

  useEffect(() => {
    setPostsFromSSR(postsFromSSR);
    if (postId) {
      const exists = postsFromSSR.find((item) => item._id === postId);
      if (!exists) {
        getPosts({ getNewerPosts: true, lastPostDate: postCreated });
      }
    }
  }, [postsFromSSR, setPostsFromSSR, postId, getPosts, postCreated]);

  const handleMockTwitterSignIn = async () => {
    setIsMockAuthLoading(true);
    setMockAuthMessage(null);
    try {
      const response = await mockTwitterSignIn();
      const username = response?.user?.username || "mock_user";
      setMockAuthMessage({
        type: "success",
        text: `Mock Twitter sign-in successful for @${username}.`,
      });
    } catch (error) {
      setMockAuthMessage({
        type: "error",
        text: "Mock Twitter sign-in failed. Please try again.",
      });
    } finally {
      setIsMockAuthLoading(false);
    }
  };

  return (
    // Set up 2 columns (first is 300px with, second is remaining space)
    <div className="grid grid-cols-[350px_1fr] h-screen max-h-screen">
      <div className="flex flex-col text-white overflow-hidden">
        <div className="bg-slate-800 px-2">
          <Logo />
          <Link href="/post/new" className="btn">
            New post
          </Link>
          <Link href="/token-topup" className="block mt-2 text-center ">
            <FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
            <span className="pl-1">{availableTokens} tokens available</span>
          </Link>
        </div>
        <div className="px-4 flex-1 overflow-auto bg-gradient-to-b from-slate-800 to-cyan-800">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post._id}`}
              className={`${
                postId === post._id ? "bg-white/20 border-white " : ""
              } py-1 border border-white/0 block text-ellipsis overflow-hidden whitespace-nowrap my-1 px-2 bg-white/10 cursor-pointer rounded-sm`}
            >
              {post.topic}
            </Link>
          ))}
          {!noMorePosts && (
            <div
              onClick={() =>
                getPosts({ lastPostDate: posts[posts.length - 1].created })
              }
              className="hover:underline text-sm text-slate-400 text-center cursor-pointer mt-4"
            >
              Load more posts
            </div>
          )}
        </div>
        <div className="bg-cyan-800 border-t border-t-black/50 px-2 py-3 min-h-[5rem]">
          {!!user ? (
            <div className="flex items-center gap-2">
              <div className="min-w-[50px]">
                <Image
                  src={user.picture}
                  alt={user.name}
                  height={50}
                  width={50}
                  className="rounded-full"
                />
              </div>
              <div className="flex-1">
                <div className="font-bold">{user.email}</div>
                <Link className="text-sm" href="/api/auth/logout">
                  Logout
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/api/auth/login" className="btn">
                Login
              </Link>
              <button
                type="button"
                onClick={handleMockTwitterSignIn}
                className="btn bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 disabled:cursor-not-allowed"
                disabled={isMockAuthLoading}
              >
                {isMockAuthLoading ? "Signing in..." : "Mock Twitter Sign-In"}
              </button>
              <p className="text-xs text-slate-200">
                This mock option is for demo purposes only and is separate from
                real authentication.
              </p>
              {mockAuthMessage && (
                <div
                  className={`text-xs ${
                    mockAuthMessage.type === "error"
                      ? "text-red-200"
                      : "text-emerald-200"
                  }`}
                >
                  {mockAuthMessage.text}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};