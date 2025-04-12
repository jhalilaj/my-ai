export const runtime = "nodejs"; // Ensure Node.js runtime

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lesson from "@/models/Lesson";
import Topic from "@/models/Topic";
import OpenAI from "openai";

// Create an OpenAI instance for GPT (use your GPT API key)
const openai = new OpenAI({
  apiKey: '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',
});

// Llama API details (OpenRouter)
// (Reused for Llama, Gemini, and Deepseek)
const llamaApiKey = "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";

export async function POST(req: Request) {
  await connectDB();

  try {
    console.log("✅ Received Request for Lesson Generation");

    const { topicId, content, depth, aiModel } = await req.json();
    console.log("➡️ Data received:", { topicId, content, depth, aiModel });

    if (!topicId || !content || !depth || !aiModel) {
      console.log("❌ Invalid input data");
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      console.log("❌ Topic not found");
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // ✅ Multi-file content merging logic
    let extractedText = "";
    if (Array.isArray(content)) {
      console.log("📂 Multiple file inputs detected. Extracting text from each...");
      for (const filePath of content) {
        const fileRes = await fetch(`http://localhost:3000/api/files/read?filePath=${encodeURIComponent(filePath)}`);
        const fileData = await fileRes.json();

        if (fileData.success && fileData.content) {
          extractedText += "\n\n" + fileData.content;
        } else {
          console.error(`❌ Failed to extract content from ${filePath}`);
        }
      }
    } else if (typeof content === "string" && content.startsWith("/uploads/")) {
      console.log("📂 Single file input. Extracting text...");
      const fileRes = await fetch(`http://localhost:3000/api/files/read?filePath=${encodeURIComponent(content)}`);
      const fileData = await fileRes.json();

      if (fileData.success && fileData.content) {
        extractedText = fileData.content;
      } else {
        console.error("❌ Failed to extract content from file.");
        return NextResponse.json({ error: "Failed to read file content." }, { status: 500 });
      }
    } else {
      extractedText = content;
    }

    console.log("🧠 Extracted Text Preview:", extractedText.substring(0, 500));

    // Determine which AI to use and generate sections
    let usedAI = "";
    let sectionResponseData: any = null;
    const sectionPrompt = `
      You are an AI tutor. Analyze the following content and determine how to split it into multiple sections based on its complexity.
      If the content is too difficult or complex, split it into more parts with detailed explanations.
      If the content is simple, divide it into 2-3 parts, providing a concise overview of each.

      Topic Content:
      ${extractedText}

      Provide a list of sections where the content will be divided.
      Example format: ["Section 1", "Section 2", "Section 3", ...]
      
      Only return the section list.
    `;

    if (aiModel === "llama") {
      usedAI = "Llama";
      console.log("🔍 Using Llama API for section generation.");
      const llamaSectionRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${llamaApiKey}`,
          "HTTP-Referer": "https://your-site-url.com",
          "X-Title": "YourSiteName",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout:free",
          messages: [
            { role: "user", content: [{ type: "text", text: sectionPrompt }] },
          ],
        }),
      });
      const llamaSectionData = await llamaSectionRes.json();
      sectionResponseData = llamaSectionData.choices?.[0]?.message?.content || "[]";
    } else if (aiModel === "gemini") {
      usedAI = "Gemini";
      console.log("🔍 Using Gemini API for section generation.");
      const geminiSectionRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${llamaApiKey}`, // Reusing same API key
          "HTTP-Referer": "https://your-site-url.com",
          "X-Title": "YourSiteName",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro-exp-03-25:free",
          messages: [
            { role: "user", content: [{ type: "text", text: sectionPrompt }] },
          ],
        }),
      });
      const geminiSectionData = await geminiSectionRes.json();
      sectionResponseData = geminiSectionData.choices?.[0]?.message?.content || "[]";
    } else if (aiModel === "deepseek") {
      usedAI = "Deepseek";
      console.log("🔍 Using Deepseek API for section generation.");
      const deepseekSectionRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${llamaApiKey}`, // Reusing same API key
          "HTTP-Referer": "https://your-site-url.com",
          "X-Title": "YourSiteName",
          "Content-Type": "application/json",
        },
        // For Deepseek, the message format is a plain text prompt.
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324:free",
          messages: [
            { role: "user", content: sectionPrompt },
          ],
        }),
      });
      const deepseekSectionData = await deepseekSectionRes.json();
      sectionResponseData = deepseekSectionData.choices?.[0]?.message?.content || "[]";
    } else {
      usedAI = "GPT";
      console.log("🔍 Using GPT API for section generation.");
      const gptSectionRes = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: sectionPrompt }],
      });
      sectionResponseData = gptSectionRes.choices?.[0]?.message?.content || "[]";
    }

    // Extract and parse JSON from the section response
    const jsonMatch = sectionResponseData.match(/```json\s*([\s\S]*?)\s*```/i);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : sectionResponseData.replace(/```/g, "").trim();

    let sections;
    try {
      sections = JSON.parse(jsonString);
      if (!Array.isArray(sections) || sections.length === 0) {
        throw new Error("OpenAI response is not a valid JSON array.");
      }
    } catch (error) {
      console.error("❌ Error parsing OpenAI response:", error);
      return NextResponse.json({ error: "Failed to generate sections due to OpenAI response format." }, { status: 500 });
    }

    console.log(`✅ Sections Generated (${usedAI}): ${sections.length}`);

    // Generate lessons for each section using the selected AI
    let lessons = [];
    for (let i = 0; i < sections.length; i++) {
      console.log(`📝 Generating Lesson ${i + 1} (${usedAI}): ${sections[i]}`);
      const lessonPrompt = `
        You are an expert AI tutor. Generate a detailed lesson for the section titled "${sections[i]}" from the given topic content.
        The lesson should include:
        - Introduction to the section
        - Key Concepts
        - In-depth Explanation
        - Real-world Examples
        - Summary and Review
        Topic Content: ${extractedText}
      `;

      let lessonContent = "";
      if (aiModel === "llama") {
        const llamaLessonRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${llamaApiKey}`,
            "HTTP-Referer": "https://your-site-url.com",
            "X-Title": "YourSiteName",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-4-scout:free",
            messages: [
              { role: "user", content: [{ type: "text", text: lessonPrompt }] },
            ],
          }),
        });
        const llamaLessonData = await llamaLessonRes.json();
        lessonContent = llamaLessonData.choices?.[0]?.message?.content || "";
      } else if (aiModel === "gemini") {
        console.log("🔍 Using Gemini API for lesson generation.");
        const geminiLessonRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${llamaApiKey}`, // Reusing same API key
            "HTTP-Referer": "https://your-site-url.com",
            "X-Title": "YourSiteName",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-pro-exp-03-25:free",
            messages: [
              { role: "user", content: [{ type: "text", text: lessonPrompt }] },
            ],
          }),
        });
        const geminiLessonData = await geminiLessonRes.json();
        lessonContent = geminiLessonData.choices?.[0]?.message?.content || "";
      } else if (aiModel === "deepseek") {
        console.log("🔍 Using Deepseek API for lesson generation.");
        const deepseekLessonRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${llamaApiKey}`, // Reusing same API key
            "HTTP-Referer": "https://your-site-url.com",
            "X-Title": "YourSiteName",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: [
              { role: "user", content: lessonPrompt },
            ],
          }),
        });
        const deepseekLessonData = await deepseekLessonRes.json();
        lessonContent = deepseekLessonData.choices?.[0]?.message?.content || "";
      } else {
        const gptLessonRes = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: lessonPrompt }],
        });
        lessonContent = gptLessonRes.choices?.[0]?.message?.content || "";
      }
      
      const lesson = new Lesson({
        topicId,
        lessonNumber: i + 1,
        title: `Lesson ${i + 1}: ${sections[i]}`,
        content: lessonContent,
      });
      
      await lesson.save();
      lessons.push(lesson._id);
    }

    topic.lessons = lessons;
    topic.totalLessons = lessons.length;
    await topic.save();

    console.log(`✅ Lessons Generated Successfully using ${usedAI} API.`);
    return NextResponse.json({ success: true, lessons });
  } catch (error) {
    console.error("❌ Lesson Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate lessons." }, { status: 500 });
  }
}
