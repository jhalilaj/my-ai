import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import File from "@/models/File";
import { auth } from "@/auth";

export async function POST(req: Request) {
  await connectDB();
  const session = await auth();

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const { topicTitle, teachingStyle, fileId } = await req.json();

    if (!topicTitle && !fileId) {
      return NextResponse.json({ error: "Missing topic title or file" }, { status: 400 });
    }

    let finalTitle = topicTitle;

    // ✅ If a file was uploaded, use its name as the title
    if (fileId) {
      const fileObjectId = new mongoose.Types.ObjectId(fileId); // ✅ Convert to ObjectId
      const file = await File.findById(fileObjectId);

      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      finalTitle = file.fileName;
    }

    // ✅ Decide total lessons based on teaching style
    const lessonCount = teachingStyle === "Simple" ? 3 : teachingStyle === "Intermediate" ? 5 : 10;

    // ✅ Create new topic
    const newTopic = new Topic({
      userId: session.user.email,
      title: finalTitle,
      teachingStyle,
      totalLessons: lessonCount,
      completedLessons: 0,
      averageScore: 0,
      lessons: [], // Placeholder
    });

    await newTopic.save();

    return NextResponse.json({ success: true, topic: newTopic }, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
  }
}
