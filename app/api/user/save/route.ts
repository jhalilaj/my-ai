import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";


export async function POST(req: Request) {
  console.log("API route triggered"); 
  
  await connectDB();
  const session = await auth();
  console.log("Session Data: ", session); 

  if (!session?.user?.id) {
    console.log("User not authenticated");
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const existingUser = await User.findOne({ id: session.user.id });
    console.log("Existing User Check: ", existingUser);

    if (!existingUser) {
      const user = new User({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      });

      await user.save();
      console.log("User Saved: ", user);  
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Error in saving user: ", error);  
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}
