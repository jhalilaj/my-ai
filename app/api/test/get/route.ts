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

    // ✅ Fetch test by lessonId
    const test = await Test.findOne({ lessonId });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    console.log(`✅ Test fetched for Lesson ${lessonId}`);

    return NextResponse.json({ success: true, test });
  } catch (error) {
    console.error("❌ Error fetching test:", error);
    return NextResponse.json({ error: "Failed to fetch test." }, { status: 500 });
  }
}
