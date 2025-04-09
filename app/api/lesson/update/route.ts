import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lesson from "@/models/Lesson";

export async function PATCH(req: { json: () => PromiseLike<{ lessonId: any; completed: any; }> | { lessonId: any; completed: any; }; }) {
  await connectDB();

  try {
    const { lessonId, completed } = await req.json();

    if (!lessonId || completed === undefined) {
      return NextResponse.json({ error: "Missing lessonId or Missing completed status" }, { status: 400 });
    }

    // Find and update the lesson by its ID
    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId, // Find by lesson ID
      { completed }, // Update the completed status
      { new: true } // Return the updated document
    );

    if (!updatedLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, updatedLesson });
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
  }
}
