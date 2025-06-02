import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function POST(req: Request) {
  const { email, password, confirmPassword } = await req.json();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return NextResponse.json({ message: "User already exists." }, { status: 400 });
  }

  const userId = email.split('@')[0]; 
  const name = email.split('@')[0]; 

  try {
    const newUser = new User({
      id: userId, 
      name, 
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
