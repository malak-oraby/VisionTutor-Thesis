import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./lib/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VisionTutor - AI-Powered Tutoring",
  description: "Learn coding and math with an AI tutor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
