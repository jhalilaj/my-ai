import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB(); 
    console.log("🚀 Database connected");

    const { id } = await req.json(); 
    console.log("🔍 Received topic ID:", id);

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing topic ID" }, { status: 400 });
    }

    const deletedTopic = await Topic.findByIdAndDelete(id);

    if (!deletedTopic) {
      return NextResponse.json({ success: false, message: "Topic not found" }, { status: 404 });
    }

    console.log("✅ Topic deleted successfully:", deletedTopic);

    return NextResponse.json({ success: true, message: "Topic deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error(" Error deleting topic:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
