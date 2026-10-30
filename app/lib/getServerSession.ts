// app/lib/getServerSession.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JwtPayload {
  userId: string;
  email: string;
}

export async function getServerSession(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}
