import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

// Sign up handler
export async function POST(req: Request) {
  const { email, password, confirmPassword } = await req.json();

  // Ensure email is valid
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return NextResponse.json({ message: "User already exists." }, { status: 400 });
  }

  // Generate user id and default name if not available
  const userId = email.split('@')[0]; // Use the email prefix as the ID (you could modify this logic)
  const name = email.split('@')[0]; // Or just use email prefix as default name

  // Create new user and save
  try {
    const newUser = new User({
      id: userId, // Now using generated ID
      name, // Default name
      email,
      createdAt: new Date(),
    });

    await connectDB();
    await newUser.save();

    return NextResponse.json({ message: "User created successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error saving user:", error);
    return NextResponse.json({ message: "Error creating user." }, { status: 500 });
  }
}
