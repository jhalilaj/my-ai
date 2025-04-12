// /app/api/chat/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lesson from "@/models/Lesson";
import Topic from "@/models/Topic";

// Instantiate OpenAI client for GPT responses using the hardcoded API key
const openai = new OpenAI({
  apiKey:
    "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",
});

// Hardcoded API key for external models via OpenRouter (used for Llama, Gemini, Deepseek)
const openRouterApiKey =
  "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";

export async function POST(request: Request) {
  try {
    // Connect to your database
    await connectDB();
    const { prompt, lessonId } = await request.json();
    console.log("Received prompt:", prompt, "for lesson:", lessonId);

    if (!prompt || !lessonId) {
      return NextResponse.json(
        { error: "Missing prompt or lessonId" },
        { status: 400 }
      );
    }

    // Fetch lesson and then the related topic to retrieve the chosen AI model
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
    const topic = await Topic.findById(lesson.topicId);
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }
    
    // Retrieve the chosen AI model (e.g., "gpt", "llama", "gemini", "deepseek")
    const chosenModel = topic.aiModel || "gpt";
    console.log("Chosen AI model for this topic:", chosenModel);

    // If the prompt asks for an image, route to image generation
    const isImageRequest = /generate an image|show me an image|create an image/i.test(prompt);
    if (isImageRequest) {
      console.log("Generating an image...");
      try {
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
        });
        console.log("OpenAI Image Response:", JSON.stringify(imageResponse, null, 2));
        if (imageResponse?.data?.[0]?.url) {
          return NextResponse.json({ image: imageResponse.data[0].url });
        } else {
          console.error("No image URL returned from OpenAI");
          return NextResponse.json(
            { error: "OpenAI did not return an image." },
            { status: 500 }
          );
        }
      } catch (imageError) {
        console.error("Image Generation Error:", imageError);
        return NextResponse.json(
          { error: "Error generating image." },
          { status: 500 }
        );
      }
    }

    // Otherwise, generate a text response using the chosen AI model
    let assistantMessage = "";
    if (chosenModel === "llama") {
      console.log("Using Llama API for text response.");
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "HTTP-Referer": "https://your-site-url.com",
          "X-Title": "YourSiteName",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      assistantMessage = data.choices?.[0]?.message?.content || "";
    } else if (chosenModel === "gemini") {
      console.log("Using Gemini API for text response.");
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "HTTP-Referer": "https://your-site-url.com",
          "X-Title": "YourSiteName",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro-preview-03-25",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      assistantMessage = data.choices?.[0]?.message?.content || "";
    } else if (chosenModel === "deepseek") {
      console.log("Using Deepseek API for text response.");
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "HTTP-Referer": "https://your-site-url.com",
          "X-Title": "YourSiteName",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      assistantMessage = data.choices?.[0]?.message?.content || "";
    } else {
      console.log("Using GPT API for text response.");
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
      });
      assistantMessage = response.choices?.[0]?.message?.content || "";
    }
    
    console.log("Assistant response:", assistantMessage);
    return NextResponse.json({ message: assistantMessage });
    
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
