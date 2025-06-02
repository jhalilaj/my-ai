import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";

export async function PUT(req: NextRequest) {
  try {
    await connectDB(); 
    console.log("🚀 Database connected");

    const { id, newTitle } = await req.json(); 
    console.log("🔍 Updating topic:", id, "New Title:", newTitle);

    if (!id || !newTitle) {
      return NextResponse.json({ success: false, message: "Missing ID or Title" }, { status: 400 });
    }

    const updatedTopic = await Topic.findByIdAndUpdate(id, { title: newTitle }, { new: true });

    if (!updatedTopic) {
      return NextResponse.json({ success: false, message: "Topic not found" }, { status: 404 });
    }

    console.log("✅ Topic updated successfully:", updatedTopic);
    return NextResponse.json({ success: true, message: "Topic updated successfully", updatedTopic }, { status: 200 });

  } catch (error) {
    console.error(" Error updating topic:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
