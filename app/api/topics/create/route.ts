import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import { auth } from "@/auth"; // Ensure authentication

export async function POST(req: Request) {
  await connectDB();

  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topicTitle, teachingStyle, fileId } = await req.json();

    if (!topicTitle || !teachingStyle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTopic = new Topic({
      userId: session.user.email,
      title: topicTitle,
      teachingStyle,
      totalLessons: 0,
      completedLessons: 0,
      averageScore: 0,
      lessons: [],
    });

    await newTopic.save();

    console.log("✅ Topic Created:", newTopic._id);
    
    // ✅ Explicitly return topicId in response
    return NextResponse.json({ success: true, topicId: newTopic._id });
  } catch (error) {
    console.error("❌ Error creating topic:", error);
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
  }
}
