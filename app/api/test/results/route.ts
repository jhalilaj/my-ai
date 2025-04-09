import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Test from "@/models/Test";

export async function GET(req: Request) {
  console.log("📥 Received request to fetch test results.");

  await connectDB(); // Ensure MongoDB is connected

  try {
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      console.error("❌ Missing lessonId in request.");
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
    }

    console.log(`🔎 Fetching tests for lessonId: ${lessonId}`);
    const tests = await Test.find({ lessonId }).sort({ createdAt: -1 });

    if (!tests || tests.length === 0) {
      console.warn(`⚠️ No tests found for lessonId: ${lessonId}`);
      return NextResponse.json({ success: true, tests: [], message: "No tests available" });
    } else {
      console.log(`✅ Found ${tests.length} tests for lessonId: ${lessonId}`);
    }

    return NextResponse.json({ success: true, tests });
  } catch (error) {
    console.error("❌ Fetching Test Results Error:", error);
    return NextResponse.json({ error: "Failed to fetch test results." }, { status: 500 });
  }
}
