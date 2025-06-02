import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import mongoose from "mongoose";

export async function GET(req: Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const topicId = searchParams.get("topicId");

        if (!topicId) {
            return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
        }

        console.log(`🔎 Fetching Topic with ID: ${topicId}`);

        if (!mongoose.Types.ObjectId.isValid(topicId)) {
            console.error(" Invalid topicId format");
            return NextResponse.json({ error: "Invalid topicId format" }, { status: 400 });
        }

        const topic = await Topic.findById(topicId).lean();

        if (!topic) {
            console.error(` Topic not found for ID: ${topicId}`);
            return NextResponse.json({ error: "Topic not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, topic });
    } catch (error) {
        console.error(" Error fetching topic:", error);
        return NextResponse.json({ error: "Failed to fetch topic" }, { status: 500 });
    }
}
