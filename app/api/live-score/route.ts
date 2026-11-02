// app/api/live-score/route.ts
// V2: scores the conversation so far, so the page can choose a teaching mode.
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/app/lib/getServerSession";
import { liveScore, ScoringMessage } from "@/app/lib/scoring";

const MAX_MESSAGES = 200;
const MAX_CONTENT = 2000;

export async function POST(req: NextRequest) {
  const userSession = await getServerSession(req);
  if (!userSession || !userSession.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const raw = Array.isArray(body?.messages) ? body.messages.slice(-MAX_MESSAGES) : [];
  const messages: ScoringMessage[] = raw
    .filter(
      (m: any) => m && (m.role === "human" || m.role === "ai") && typeof m.content === "string" && m.content.trim()
    )
    .map((m: any) => ({
      role: m.role,
      content: m.content.trim().slice(0, MAX_CONTENT),
      timestamp: new Date(m.timestamp || Date.now()),
    }));

  const score = await liveScore(messages);
  return NextResponse.json({ score });
}
