import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    const conn = await connectToDatabase();

    return NextResponse.json({
      message: "Backend is working!",
      database: "Connected",
      status: "OK",
    });
  } catch (error: any) {
    console.error("API test error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to connect to database" },
      { status: 500 }
    );
  }
}
