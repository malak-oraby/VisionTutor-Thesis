"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip check if still loading
    if (loading) return;

    // If not authenticated and not on public path, redirect to login
    if (!user && !isPublicPath(pathname)) {
      router.push("/login");
    }
  }, [user, loading, router, pathname]);

  // Show nothing while loading
  if (loading) return null;

  // If authenticated or on public path, show children
  return <>{children}</>;
}

function isPublicPath(path: string) {
  const publicPaths = ["/", "/login", "/register"];
  return publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
  );
}
