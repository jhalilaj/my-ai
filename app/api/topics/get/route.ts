import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import { auth } from "@/auth";

export async function GET(req: Request) {
  await connectDB();
  const session = await auth();

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    // ✅ Fetch topics with a proper TypeScript interface
    const topics = await Topic.find({ userId: session.user.email }).lean();

    // ✅ Ensure _id is converted to a string
    const formattedTopics = topics.map((topic: any) => ({
      id: topic._id?.toString(), // Convert `_id` to `id`
      title: topic.title,
      completedLessons: topic.completedLessons || 0,
      totalLessons: topic.totalLessons || 0,
      averageScore: topic.averageScore || 0,
    }));

    return NextResponse.json({ success: true, topics: formattedTopics });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}
