// /app/api/generate-test/route.ts
export const runtime = "nodejs"; // Ensure we're using the Node.js runtime

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Test from "@/models/Test";
import Lesson from "@/models/Lesson";
import Topic from "@/models/Topic";
const openrouterApiKey =
  process.env.OPENROUTER_API_KEY ||
  "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";

async function callOpenRouter(model: string, prompt: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openrouterApiKey}`,
      "HTTP-Referer": "https://your-site-url.com",
      "X-Title": "YourSiteName",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });
  const json = await res.json();
  return json.choices?.[0]?.message?.content || "[]";
}

export async function POST(req: Request) {
  await connectDB();

  try {
    const { lessonId } = await req.json();
    if (!lessonId) {
      console.error(" Missing lessonId");
      return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
    }
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      console.error(" Lesson not found for lessonId:", lessonId);
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
    const topic = await Topic.findById(lesson.topicId);
    if (!topic) {
      console.error(" Topic not found for lessonId:", lessonId);
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }
    const chosenModel = topic.aiModel || "gpt";
    console.log("▶️  Using model:", chosenModel);
    const prompt = `
    Analyze the lesson content and decide how many of each type of question to generate. Generate the questions accordingly:
        
    - Multiple Choice Questions (MCQs): Generate at least 2 MCQs, but if the content is more factual or has clear answers, generate 3 or 4.
    - Theoretical Questions: If the content is more concept-based or requires detailed explanations, generate 2 or more theoretical questions.
    - Practical Questions: If the content involves code examples, algorithms, or implementation tasks, generate at least 1 practical question.
        
    The questions should follow the structure below:
    - "type": "mcq" | "theory" | "practical"
    - "question": the actual question
    - "options": (only for mcq, an array of 4 options)
    - "correctAnswer": "A"/"B"/"C"/"D" for mcq, or a sample answer for theory/practical
        
    Here is the lesson content:
    ${lesson.content}

    Generate the questions based on the content.

    Return the test as a JSON array. Each object must include:
    - "type": "mcq" | "theory" | "practical"
    - "question": the actual question
    - "options": (only for mcq, an array of 4 options)
    - "correctAnswer": "A"/"B"/"C"/"D" for mcq, or a sample answer for theory/practical
        `.trim();
    let testRawResponse: string;
    switch (chosenModel) {
      case "llama":
        console.log("  Using Llama API for test generation.");
        testRawResponse = await callOpenRouter("meta-llama/llama-4-scout", prompt);
        break;

      case "gemini":
        console.log("  Using Gemini API for test generation.");
        testRawResponse = await callOpenRouter("google/gemini-2.0-flash-001", prompt);
        break;

      case "deepseek":
        console.log("  Using Deepseek API for test generation.");
        testRawResponse = await callOpenRouter("deepseek/deepseek-chat-v3-0324", prompt);
        break;

      default:
        console.log("  Routing GPT → openrouter.ai");
        testRawResponse = await callOpenRouter("openai/gpt-4o", prompt);
        break;
    }

    console.log("Raw AI Test Response:", testRawResponse);

    const jsonMatch = testRawResponse.match(/```json\s*([\s\S]*?)\s*```/i);
    const jsonString = jsonMatch
      ? jsonMatch[1].trim()
      : testRawResponse.replace(/```/g, "").trim();

    let parsedTest: any[];
    try {
      parsedTest = JSON.parse(jsonString);
    } catch (err) {
      console.error(" JSON parse error:", err);
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 500 }
      );
    }
    if (!Array.isArray(parsedTest) || parsedTest.length < 2) {
      console.error(" Insufficient questions generated:", parsedTest);
      return NextResponse.json(
        { error: "Failed to generate sufficient questions" },
        { status: 500 }
      );
    }

    const testDoc = new Test({
      lessonId,
      questions: parsedTest.map((q) => ({
        type: q.type,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
      })),
      correctAnswers: parsedTest.map((q) =>
        q.type === "mcq" ? ["A", "B", "C", "D"].indexOf(q.correctAnswer) : null
      ),
    });
    await testDoc.save();

    return NextResponse.json({ success: true, test: testDoc });
  } catch (error) {
    console.error(" Test Generation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
