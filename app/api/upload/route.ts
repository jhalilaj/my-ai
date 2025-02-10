import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import User from "@/models/User"; // Import User model

const FileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const FileModel = mongoose.models.File || mongoose.model("File", FileSchema);

export async function POST(req: Request) {
  try {
    // Get logged-in user session
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to MongoDB
    await connectDB();

    // Find user in MongoDB using email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Authenticated MongoDB User ID:", user._id); // Debugging

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure the uploads directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true }); // Creates the directory if it doesn't exist

    // Save file to disk
    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    // Store metadata in MongoDB with MongoDB user ID
    await FileModel.create({
      userId: user._id,
      fileName: file.name,
      filePath: `/uploads/${file.name}`,
    });

    return NextResponse.json({ success: true, filePath: `/uploads/${file.name}` });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
