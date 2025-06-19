import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function POST(req: Request) {
  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid or missing JSON body." }, { status: 400 });
  }

  const { email, password, confirmPassword } = data;
  if (!email || !password || !confirmPassword) {
    return NextResponse.json({ message: "All fields are required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ message: "Passwords do not match." }, { status: 400 });
  }
  try {
    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.password) {
        return NextResponse.json({
          message: "This email is already registered using Google or GitHub. Please use social login.",
        }, { status: 400 });
      }

      return NextResponse.json({ message: "User already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      id: email.split("@")[0],
      name: email.split("@")[0],
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    await newUser.save();

    return NextResponse.json({ message: "User created successfully." }, { status: 200 });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Error creating user." }, { status: 500 });
  }
}
