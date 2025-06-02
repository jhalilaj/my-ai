import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Test from "@/models/Test";

export async function DELETE(req: Request) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const testId = searchParams.get("id");

    if (!testId) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 });
    }

    const deleted = await Test.findByIdAndDelete(testId);

    if (!deleted) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    console.log(`🗑️ Deleted test with ID: ${testId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(" Error deleting test:", error);
    return NextResponse.json({ error: "Failed to delete test." }, { status: 500 });
  }
}
