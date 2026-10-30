// app/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "./lib/getServerSession";

// Paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
];

// Check if the path is public
const isPublicPath = (path: string) => {
  return publicPaths.some((publicPath) => {
    return path === publicPath || path.startsWith(publicPath + "/");
  });
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // API routes middleware
  if (path.startsWith("/api/") && !path.startsWith("/api/auth/")) {
    const session = await getServerSession(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Page routes middleware
  if (!isPublicPath(path)) {
    const session = await getServerSession(request);

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Match all routes except for static files, api routes and _next
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg).*)",
    "/api/:path*",
  ],
};
