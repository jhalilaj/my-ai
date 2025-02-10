import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TestResult from "@/models/TestResult";

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { lessonId, userId, answers, score } = await req.json();

        // Save the test result with the score and other details
        const savedResult = await TestResult.create({
            lessonId,
            userId,
            answers,
            score,
            submittedAt: new Date(), // Ensure that this is a valid date
        });
        

        console.log("Saved result with timestamp:", savedResult.submittedAt); // Add this log to confirm the saved date
        // Log the saved result for debugging
        console.log("Test result saved:", savedResult);

        // Return success response with the result
        return NextResponse.json({ message: "Test submitted successfully.", result: savedResult }, { status: 201 });
    } catch (error) {
        console.error("Error in submitting test:", error);
        return NextResponse.json({ error: "Failed to submit test." }, { status: 500 });
    }
}
