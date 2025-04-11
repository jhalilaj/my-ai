import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Test from "@/models/Test";
import Lesson from "@/models/Lesson";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Init Gemini with API Key
const genAI = new GoogleGenerativeAI("AIzaSyAQlxjcmyh0HGF-CL-M4GpAOREPP2MwkC4");


export async function POST(req: Request) {
  await connectDB();

  try {
    const { lessonId } = await req.json();

    if (!lessonId) {
      console.error("❌ Missing lessonId");
      return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      console.error("❌ Lesson not found for lessonId:", lessonId);
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const prompt = `
      Analyze the lesson content and decide how many of each type of question to generate:

      - Multiple Choice Questions (MCQs): At least 2 MCQs
      - Theoretical Questions: 2 or more
      - Practical Questions: At least 1

      The format should be:
      [
        {
          "type": "mcq" | "theory" | "practical",
          "question": "string",
          "options": ["A", "B", "C", "D"], // only for mcq
          "correctAnswer": "A"/"B"/"C"/"D" (for mcq) or sample answer for others
        }
      ]

      Here is the lesson content:
      ${lesson.content}
    `.trim();

    // Use gemini-pro in chat mode
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat();
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();

    console.log("🧠 Raw Gemini Response:", text);

    // Clean and parse the response
    const cleanJson = text.replace(/```json|```/g, "").trim();

    let parsedTest;
    try {
      parsedTest = JSON.parse(cleanJson);
    } catch (err) {
      console.error("❌ Parsing error:", err);
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
    }

    if (!parsedTest || parsedTest.length < 2) {
      console.error("❌ Insufficient questions generated");
      return NextResponse.json({ error: "Failed to generate sufficient questions" }, { status: 500 });
    }

    const test = new Test({
      lessonId,
      questions: parsedTest.map((q: any) => ({
        type: q.type,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
      })),
      correctAnswers: parsedTest.map((q: any) =>
        q.type === "mcq" ? ["A", "B", "C", "D"].indexOf(q.correctAnswer) : null
      ),
    });

    await test.save();

    return NextResponse.json({ success: true, test });
  } catch (error: any) {
    console.error("❌ Test Generation Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}