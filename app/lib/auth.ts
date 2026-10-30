// app/lib/auth.ts (enhanced utility functions)
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "./mongodb";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function getUserFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };

    await connectToDatabase();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return null;

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest) {
  return req.cookies.get("auth-token")?.value;
}
