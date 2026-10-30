import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Note from "@/app/models/Note";
import { getServerSession } from "@/app/lib/getServerSession";

interface Params {
  params: {
    id: string;
  };
}

// GET a specific note by ID
export async function GET(req: NextRequest, { params }: Params) {
  try {
    // Get user session
    const userSession = await getServerSession(req);

    if (!userSession || !userSession.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const note = await Note.findOne({
      _id: params.id,
      userId: userSession.userId,
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error: any) {
    console.error("Note fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

// Update a note
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    // Get user session
    const userSession = await getServerSession(req);

    if (!userSession || !userSession.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { title, content, tags } = await req.json();

    const note = await Note.findOneAndUpdate(
      {
        _id: params.id,
        userId: userSession.userId,
      },
      {
        title,
        content,
        tags,
      },
      { new: true }
    );

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error: any) {
    console.error("Note update error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

// Delete a note
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    // Get user session
    const userSession = await getServerSession(req);

    if (!userSession || !userSession.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const result = await Note.deleteOne({
      _id: params.id,
      userId: userSession.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error: any) {
    console.error("Note deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
