// /app/api/generate-test/route.ts
export const runtime = "nodejs"; // Ensure we're using the Node.js runtime

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Test from "@/models/Test";
import Lesson from "@/models/Lesson";
import Topic from "@/models/Topic";
import OpenAI from "openai";

// Instantiate OpenAI client for GPT (hardcoded API key)
const openai = new OpenAI({
  apiKey:
    "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",
});

// Hardcoded API key for external models via OpenRouter (used for Llama, Gemini, Deepseek)
const openrouterApiKey =
  "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";

export async function POST(req: Request) {
  // Connect to MongoDB
  await connectDB();

  try {
    // Parse the POST JSON body and extract lessonId
    const { lessonId } = await req.json();

    if (!lessonId) {
      console.error("❌ Missing lessonId");
      return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
    }

    // Check if the lesson exists in the DB
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      console.error("❌ Lesson not found for lessonId:", lessonId);
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Fetch the related topic to retrieve the chosen AI model
    const topic = await Topic.findById(lesson.topicId);
    if (!topic) {
      console.error("❌ Topic not found for lessonId:", lessonId);
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }
    
    // Retrieve the chosen AI model (one of: "gpt", "llama", "gemini", "deepseek")
    const chosenModel = topic.aiModel || "gpt";
    console.log("Chosen AI model for test generation:", chosenModel);

    // Build the prompt to generate test questions from lesson content
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

    let testRawResponse = "";

    // Use the selected model for generating test questions
    if (chosenModel === "llama") {
      console.log("Using Llama API for test generation.");
      const routerResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openrouterApiKey}`,
          "HTTP-Referer": "https://your-site-url.com",
          "X-Title": "YourSiteName",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });
      const routerData = await routerResponse.json();
      testRawResponse = routerData.choices?.[0]?.message?.content || "[]";
    } else if (chosenModel === "gemini") {
      console.log("Using Gemini API for test generation.");
      const routerResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openrouterApiKey}`,
          "HTTP-Referer": "https://your-site-url.com",
          "X-Title": "YourSiteName",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro-preview-03-25",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });
      const routerData = await routerResponse.json();
      testRawResponse = routerData.choices?.[0]?.message?.content || "[]";
    } else if (chosenModel === "deepseek") {
      console.log("Using Deepseek API for test generation.");
      const routerResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openrouterApiKey}`,
          "HTTP-Referer": "https://your-site-url.com",
          "X-Title": "YourSiteName",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });
      const routerData = await routerResponse.json();
      testRawResponse = routerData.choices?.[0]?.message?.content || "[]";
    } else {
      console.log("Using GPT API for test generation.");
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
      });
      testRawResponse = response.choices?.[0]?.message?.content || "[]";
    }

    console.log("Raw AI Test Response:", testRawResponse);

    // Extract only the JSON portion from within triple backticks (if present)
    const jsonMatch = testRawResponse.match(/```json\s*([\s\S]*?)\s*```/i);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : testRawResponse.replace(/```/g, "").trim();

    let parsedTest;
    try {
      parsedTest = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("❌ AI Response Parsing Error:", parseError);
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    // Verify that sufficient questions have been generated
    if (!parsedTest || parsedTest.length < 2) {
      console.error("❌ Insufficient questions generated:", parsedTest);
      return NextResponse.json({ error: "Failed to generate sufficient questions" }, { status: 500 });
    }

    // Save the generated test to your database
    const testDoc = new Test({
      lessonId,
      questions: parsedTest.map((q: { type: any; question: any; options: any; correctAnswer: any; }) => ({
        type: q.type,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
      })),
      correctAnswers: parsedTest.map((q: { type: string; correctAnswer: string; }) =>
        q.type === "mcq" ? ["A", "B", "C", "D"].indexOf(q.correctAnswer) : null
      ),
    });

    await testDoc.save();

    return NextResponse.json({ success: true, test: testDoc });
  } catch (error) {
    console.error("❌ Test Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
