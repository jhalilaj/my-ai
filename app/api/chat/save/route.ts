import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Chat from "@/models/Chat";
import { auth } from "@/auth"; 

export async function POST(req: Request) {
    await connectDB();
    const session = await auth();

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    try {
        const { lessonId, messages } = await req.json();

        if (!lessonId || !messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }

        let chat = await Chat.findOne({ userId: session.user.email, lessonId });

        if (!chat) {
            chat = new Chat({ userId: session.user.email, lessonId, messages });
        } else {
            chat.messages.push(...messages); 
        }

        await chat.save();
        return NextResponse.json({ success: true, chat });
    } catch (error) {
        console.error("Error saving chat:", error);
        return NextResponse.json({ error: "Failed to save chat" }, { status: 500 });
    }
}
