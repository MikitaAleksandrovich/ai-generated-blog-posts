import Link from "next/link";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";

export const AppLayout = ({ children }) => {
  const { user } = useUser();

  return (
    // Set up 2 columns (first is 300px with, second is remaining space)
    <div className="grid grid-cols-[350px_1fr] h-screen max-h-screen">
      <div className="flex flex-col text-white overflow-hidden">
        <div className="bg-slate-800">
          <div>logo</div>
          <div>cta button</div>
          <div>tokens</div>
        </div>
        <div className="flex-1 overflow-auto bg-gradient-to-b from-slate-800 to-cyan-800">
          list of posts
        </div>
        <div className="bg-cyan-800 flex items-center gap-2 border-t border-t-black/50 h-20 px-2">
          {!!user ? (
            <>
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
                <Link className="text-sm " href="api/auth/logout">
                  Logout
                </Link>
              </div>
            </>
          ) : (
            <Link href="api/auth/login">Login</Link>
          )}
        </div>
      </div>
      <div className="bg-yellow-500">{children}</div>
    </div>
  );
};
