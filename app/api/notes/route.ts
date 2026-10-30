// app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Note from "@/app/models/Note";
import { getServerSession } from "@/app/lib/getServerSession";

// GET all notes for the current user
export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(req);

    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get all notes for this user
    const notes = await Note.find({ userId: session.userId }).sort({
      createdAt: -1,
    }); // Sort by newest first

    return NextResponse.json({ notes });
  } catch (error: any) {
    console.error("Notes fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

// Create a new note
export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(req);

    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { sessionId, title, content, tags } = await req.json();

    // Create a new note
    const newNote = await Note.create({
      userId: session.userId,
      sessionId,
      title,
      content,
      tags: tags || [],
    });

    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (error: any) {
    console.error("Note creation error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
