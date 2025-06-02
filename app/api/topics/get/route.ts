import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import { auth } from "@/auth";

export async function GET(req: Request) {
  console.log("📥 Received request to /api/topics/get");

  await connectDB();
  const session = await auth();

  if (!session || !session.user?.email) {
    console.error(" User not authenticated");
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    console.log(`🔎 Fetching topics for user: ${session.user.email}`);
    
    const topics = await Topic.find({ userId: session.user.email }).lean();
    
    if (!topics.length) {
      console.warn("⚠️ No topics found for this user.");
    } else {
      console.log(`✅ Found ${topics.length} topics.`);
    }

    const formattedTopics = topics.map((topic: any) => ({
      id: topic._id?.toString(),
      title: topic.title,
      completedLessons: topic.completedLessons || 0,
      totalLessons: topic.totalLessons || 0,
      averageScore: topic.averageScore || 0,
    }));

    console.log("📋 Sending topics:", formattedTopics);
    return NextResponse.json({ success: true, topics: formattedTopics });
  } catch (error) {
    console.error(" Error fetching topics:", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}
