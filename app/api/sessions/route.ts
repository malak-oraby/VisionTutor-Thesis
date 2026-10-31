// app/api/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Session from "@/app/models/Session";
import { getServerSession } from "@/app/lib/getServerSession";
import { parseTutorVersion } from "@/app/lib/tutorStrategy";

// GET all sessions for the current user
export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(req);

    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get all sessions for this user
    const userSessions = await Session.find({ userId: session.userId })
      .sort({ startTime: -1 }) // Sort by newest first
      .select("-messages"); // Exclude the messages content for this listing

    return NextResponse.json({ sessions: userSessions });
  } catch (error: any) {
    console.error("Sessions fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

// Create a new session
export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(req);

    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { sessionType, codeLanguage, tutorVersion } = await req.json();

    // Create a new session
    const newSession = await Session.create({
      userId: session.userId,
      sessionType,
      codeLanguage,
      tutorVersion: parseTutorVersion(tutorVersion),
      startTime: new Date(),
      messages: [],
    });

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
