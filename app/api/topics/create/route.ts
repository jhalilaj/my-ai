import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import File from "@/models/File"; // ✅ Correct model import
import { auth } from "@/auth";

export async function POST(req: Request) {
  await connectDB();

  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topicTitle, teachingStyle, fileId } = await req.json();

    if (!teachingStyle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const fileIds = Array.isArray(fileId) ? fileId : fileId ? [fileId] : [];

    // ✅ Determine title from user input or file name
    let finalTitle = topicTitle;

    if (!finalTitle && fileIds.length > 0) {
      try {
        const firstFileId = fileIds[0];
        console.log("🧪 Trying to fetch file title from fileId:", firstFileId);

        const fileDoc = await File.findById(firstFileId);
        if (!fileDoc) {
          console.warn("❌ No file found in DB with this ID.");
        } else {
          console.log("✅ Found file in DB:", fileDoc.fileName);
          finalTitle = fileDoc.fileName.replace(/\.[^/.]+$/, ""); // Remove extension
        }
      } catch (fileErr) {
        console.error("❌ Error during file title lookup:", fileErr);
      }
    }

    if (!finalTitle) {
      finalTitle = "Untitled Topic";
    }

    // ✅ Create new topic
    const newTopic = new Topic({
      userId: session.user.email,
      title: finalTitle,
      teachingStyle,
      totalLessons: 0,
      completedLessons: 0,
      averageScore: 0,
      lessons: [],
      fileIds,
    });

    await newTopic.save();

    console.log("✅ Topic Created:", newTopic._id);

    return NextResponse.json({ success: true, topicId: newTopic._id });
  } catch (error) {
    console.error("❌ Error creating topic:", error);
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
  }
}
