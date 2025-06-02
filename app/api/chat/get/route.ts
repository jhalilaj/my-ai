import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Chat from "@/models/Chat";
import { auth } from "@/auth";

export async function GET(req: Request) {
    await connectDB();
    const session = await auth();

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
        return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
    }

    try {
        const chat = await Chat.findOne({ userId: session.user.email, lessonId });

        return NextResponse.json({ chats: chat ? chat.messages : [] });
    } catch (error) {
        console.error("Error fetching chat:", error);
        return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
    }
}
