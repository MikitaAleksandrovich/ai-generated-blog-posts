import Link from "next/link";
import { useRouter } from "next/router";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded px-4 py-2 transition ${
                    isActive ? "bg-gray-800 font-semibold" : "hover:bg-gray-800"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}