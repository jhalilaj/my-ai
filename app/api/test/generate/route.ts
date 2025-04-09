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

Include a mix of:
- Multiple Choice Questions (2)
- Theoretical Questions (1)
- Practical Questions (1)

Return the test as a JSON array. Each object must include:
- "type": "mcq" | "theory" | "practical"
- "question": the actual question
- "options": (only for mcq, an array of 4 options)
- "correctAnswer": "A"/"B"/"C"/"D" for mcq, or a sample answer for theory/practical

Example:
[
  {
    "type": "mcq",
    "question": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": "B"
  },
  {
    "type": "theory",
    "question": "Explain the concept of inheritance in OOP.",
    "correctAnswer": "Inheritance allows one class to inherit properties and methods from another."
  },
  {
    "type": "practical",
    "question": "Write a Python function to return the square of a number.",
    "correctAnswer": "def square(n): return n * n"
  }
]
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    let rawResponse = response.choices[0]?.message?.content || "[]";

    // ✅ Clean response
    rawResponse = rawResponse.replace(/```json|```/g, "").trim();

    let parsedTest;
    try {
      parsedTest = JSON.parse(rawResponse);
    } catch (error) {
      console.error("❌ AI Response Parsing Error:", error);
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    if (!Array.isArray(parsedTest)) {
      return NextResponse.json({ error: "Failed to generate valid test" }, { status: 500 });
    }

    // ✅ Save Test to DB
    const test = new Test({
      lessonId,
      questions: parsedTest.map((q: any) => ({
        type: q.type,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
      })),
      correctAnswers: parsedTest.map((q: any) => {
        return q.type === "mcq" ? ["A", "B", "C", "D"].indexOf(q.correctAnswer) : null;
      }),
    });

    await test.save();

    return NextResponse.json({ success: true, test });
  } catch (error) {
    console.error("❌ Test Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
