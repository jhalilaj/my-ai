import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import { auth } from "@/auth"; // Use auth() for NextAuth session

const FileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const FileModel = mongoose.models.File || mongoose.model("File", FileSchema);

export async function GET(req: Request) {
  try {
    await connectDB();

    // Get logged-in user session
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID missing" }, { status: 400 });
    }

    // Retrieve only the authenticated user's files
    const files = await FileModel.find({ userId });

    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
