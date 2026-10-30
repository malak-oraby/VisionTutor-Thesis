"use client";

import { useAuth } from "@/app/hooks/useAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, handleLogout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold">
              VisionTutor
            </Link>
          </div>

          <nav>
            <ul className="flex items-center gap-6">
              {user ? (
                <>
                  <li>
                    <Link
                      href="/code"
                      className={`hover:text-blue-600 ${
                        isActive("/code") ? "text-blue-600 font-medium" : ""
                      }`}
                    >
                      Code
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/math"
                      className={`hover:text-blue-600 ${
                        isActive("/math") ? "text-blue-600 font-medium" : ""
                      }`}
                    >
                      Math
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/profile"
                      className={`hover:text-blue-600 ${
                        isActive("/profile") ? "text-blue-600 font-medium" : ""
                      }`}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Button variant="outline" onClick={() => handleLogout()}>
                      Logout
                    </Button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      className={`hover:text-blue-600 ${
                        isActive("/login") ? "text-blue-600 font-medium" : ""
                      }`}
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/register">
                      <Button>Sign Up</Button>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
