// app/api/sessions/[id]/finish/route.ts
// Saves the recorded conversation, ends the session and scores it.
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Session from "@/app/models/Session";
import { getServerSession } from "@/app/lib/getServerSession";
import { scoreSession, ScoringMessage } from "@/app/lib/scoring";

const MAX_MESSAGES = 400;
const MAX_CONTENT = 4000;

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const userSession = await getServerSession(req);
    if (!userSession || !userSession.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const raw = Array.isArray(body?.messages) ? body.messages.slice(0, MAX_MESSAGES) : [];

    await connectToDatabase();
    const session = await Session.findOne({ _id: id, userId: userSession.userId });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const messages: ScoringMessage[] = raw
      .filter(
        (m: any) =>
          m &&
          (m.role === "human" || m.role === "ai") &&
          typeof m.content === "string" &&
          m.content.trim()
      )
      .map((m: any) => {
        const t = new Date(m.timestamp);
        return {
          role: m.role,
          content: m.content.trim().slice(0, MAX_CONTENT),
          timestamp: isNaN(t.getTime()) ? new Date() : t,
        };
      });

    const endTime = new Date();
    session.messages = messages as any;
    session.endTime = endTime;

    const assessment = await scoreSession(messages, session.startTime, endTime);
    session.assessment = assessment;
    await session.save();

    return NextResponse.json({ session, assessment });
  } catch (error: any) {
    console.error("Session finish error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
