// /app/api/chat/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lesson from "@/models/Lesson";
import Topic from "@/models/Topic";

// Single OpenRouter API key for all models (move to env in production)
const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY ||
  "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";

// Helper for text completions via OpenRouter
async function callOpenRouter(model: string, prompt: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
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
  return json.choices?.[0]?.message?.content || "";
}

// Helper for image generation via OpenRouter proxy to DALL·E-3
async function callOpenRouterImage(prompt: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://your-site-url.com",
      "X-Title": "YourSiteName",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    }),
  });
  const json = await res.json();
  return json.data?.[0]?.url || "";
}

export async function POST(request: Request) {
  try {

    await connectDB();

    const { prompt, lessonId } = await request.json();
    console.log("📥 Received prompt:", prompt, "for lesson:", lessonId);

    if (!prompt || !lessonId) {
      return NextResponse.json(
        { error: "Missing prompt or lessonId" },
        { status: 400 }
      );
    }
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
    const topic = await Topic.findById(lesson.topicId);
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const chosenModel = topic.aiModel || "gpt";
    console.log("▶️  Chosen AI model for this topic:", chosenModel);

    const isImageRequest = /generate an image|show me an image|create an image/i.test(
      prompt
    );
    if (isImageRequest) {
      console.log("🖼️  Generating image via OpenRouter");
      try {
        const imageUrl = await callOpenRouterImage(prompt);
        return NextResponse.json({ image: imageUrl });
      } catch (err) {
        console.error(" Image generation error:", err);
        return NextResponse.json(
          { error: "Error generating image." },
          { status: 500 }
        );
      }
    }

    let assistantMessage = "";
    switch (chosenModel) {
      case "llama":
        console.log("🦙  Using Llama API for text response.");
        assistantMessage = await callOpenRouter(
          "meta-llama/llama-4-scout",
          prompt
        );
        break;

      case "gemini":
        console.log("🤖  Using Gemini API for text response.");
        assistantMessage = await callOpenRouter(
          "google/gemini-2.0-flash-001",
          prompt
        );
        break;

      case "deepseek":
        console.log("🔍  Using Deepseek API for text response.");
        assistantMessage = await callOpenRouter(
          "deepseek/deepseek-chat-v3-0324",
          prompt
        );
        break;

      default:
        console.log("✨  Routing GPT → OpenRouter");
        assistantMessage = await callOpenRouter("openai/gpt-4o", prompt);
        break;
    }

    console.log("💬 Assistant response:", assistantMessage);
    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error(" Chat API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
