// /app/api/lesson/complete/route.ts

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lesson from "@/models/Lesson";

export async function POST(req: Request) {
  await connectDB();
  const { lessonId, completed } = await req.json();

  if (!lessonId) {
    return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
  }

  try {
    await Lesson.findByIdAndUpdate(lessonId, { completed });
    return NextResponse.json({ success: true, message: "Lesson completion updated" });
  } catch (error) {
    console.error("Error updating lesson completion:", error);
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
  }
}
