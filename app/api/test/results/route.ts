import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Test from "@/models/Test";

export async function GET(req: Request) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
    }

    const tests = await Test.find({ lessonId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, tests });
  } catch (error) {
    console.error("❌ Fetching Test Results Error:", error);
    return NextResponse.json({ error: "Failed to fetch test results." }, { status: 500 });
  }
}
