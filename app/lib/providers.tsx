// app/lib/providers.tsx
"use client";

import { AuthProvider } from "@/app/context/AuthContext";
import { SessionProvider } from "@/app/context/SessionContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SessionProvider>{children}</SessionProvider>
    </AuthProvider>
  );
}
