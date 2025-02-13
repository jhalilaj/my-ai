import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lesson from "@/models/Lesson";

export async function GET(req: Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const topicId = searchParams.get("topicId");

        if (!topicId) {
            return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
        }

        console.log(`🛠 Fetching lessons for topicId: ${topicId}`);
        const lessons = await Lesson.find({ topicId }).select("_id title content");

        console.log("✅ Lessons found:", lessons.length);
        return NextResponse.json({ success: true, lessons });
    } catch (error) {
        console.error("❌ Error fetching lessons:", error);
        return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
    }
}
