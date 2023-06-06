import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";

export default function Home() {
  const { user } = useUser();

  return (
    <div>
      <h1>This is the home page</h1>
      <div>
        {!!user ? (
          <>
            <div>
              <Image
                src={user.picture}
                alt={user.name}
                height={50}
                width={50}
              />
              <div>{user.email}</div>
            </div>
            <Link href="api/auth/logout">Logout</Link>
          </>
        ) : (
          <Link href="api/auth/login">Login</Link>
        )}
      </div>
    </div>
  );
}
