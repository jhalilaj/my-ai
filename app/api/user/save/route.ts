import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";


export async function POST(req: Request) {
  console.log("API route triggered");  // Confirm if this log is printed
  
  await connectDB();
  const session = await auth();
  console.log("Session Data: ", session);  // Ensure session is correctly retrieved

  if (!session?.user?.id) {
    console.log("User not authenticated");
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ id: session.user.id });
    console.log("Existing User Check: ", existingUser); // Log if user already exists

    if (!existingUser) {
      const user = new User({
        id: session.user.id,
        name: session.user.name,
        // avatar_url: session.user.avatar_url,
        email: session.user.email,
      });

      await user.save();
      console.log("User Saved: ", user);  // Log after saving
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Error in saving user: ", error);  // Log any error
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}
