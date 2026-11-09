"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading or nothing while checking authentication
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-vt-bg">
        <div className="animate-pulse text-coral-400">
          <div className="flex items-center justify-center flex-col">
            <div className="w-12 h-12 border-4 border-coral-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-lg font-medium text-zinc-200">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-vt-bg text-zinc-200">
      <main className="flex-grow">{children}</main>
    </div>
  );
}
