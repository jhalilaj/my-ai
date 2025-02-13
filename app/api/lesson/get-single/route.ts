import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lesson from "@/models/Lesson";

export async function GET(req: Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const lessonId = searchParams.get("lessonId");

        if (!lessonId) {
            return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
        }

        // ✅ Fetch lesson content by ID
        const lesson = await Lesson.findById(lessonId);

        return NextResponse.json({ success: true, lesson });
    } catch (error) {
        console.error("❌ Error fetching lesson:", error);
        return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
    }
}
