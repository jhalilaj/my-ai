import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Test from "@/models/Test";
import Lesson from "@/models/Lesson";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: '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',
});

export async function POST(req: Request) {
  await connectDB();

  try {
    const { lessonId } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
    }

    // ✅ Check if Lesson Exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // ✅ Generate test using AI
    const prompt = `
      Generate a test for the following lesson:
      ${lesson.content}
      Format the response as JSON array:
      [
        { "question": "Question 1", "options": ["A", "B", "C", "D"], "correctAnswer": "A" },
        { "question": "Question 2", "options": ["A", "B", "C", "D"], "correctAnswer": "B" }
      ]
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    let rawResponse = response.choices[0]?.message?.content || "[]";

    // ✅ Remove unwanted backticks and spaces
    rawResponse = rawResponse.replace(/```json|```/g, "").trim();

    let parsedTest;
    try {
      parsedTest = JSON.parse(rawResponse);
    } catch (error) {
      console.error("AI Response Parsing Error:", error);
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    if (!Array.isArray(parsedTest)) {
      return NextResponse.json({ error: "Failed to generate valid test" }, { status: 500 });
    }

    const test = new Test({
      lessonId,
      questions: parsedTest.map((q: any) => ({
        question: q.question,
        options: q.options,
      })),
      correctAnswers: parsedTest.map((q: any) => {
        return ["A", "B", "C", "D"].indexOf(q.correctAnswer); // Convert A/B/C/D → 0/1/2/3
      }),
    });


    await test.save();

    return NextResponse.json({ success: true, test });
  } catch (error) {
    console.error("Test Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
