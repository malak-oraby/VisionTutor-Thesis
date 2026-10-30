// app/api/sessions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Session from "@/app/models/Session";
import { getServerSession } from "@/app/lib/getServerSession";

interface Params {
  params: {
    id: string;
  };
}

// GET a specific session by ID
export async function GET(req: NextRequest, { params }: Params) {
  try {
    // Get user session
    const userSession = await getServerSession(req);

    if (!userSession || !userSession.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const session = await Session.findOne({
      _id: params.id,
      userId: userSession.userId,
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("Session fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

// Update session - add messages or end session
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    // Get user session
    const userSession = await getServerSession(req);

    if (!userSession || !userSession.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { action, message, endSession } = await req.json();

    const session = await Session.findOne({
      _id: params.id,
      userId: userSession.userId,
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Add a message
    if (action === "addMessage" && message) {
      session.messages.push({
        role: message.role,
        content: message.content,
        timestamp: new Date(),
      });
    }

    // End the session
    if (endSession) {
      session.endTime = new Date();
    }

    await session.save();

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("Session update error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
