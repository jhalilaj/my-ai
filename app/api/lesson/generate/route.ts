import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lesson from "@/models/Lesson";
import Topic from "@/models/Topic";

const openrouterApiKey = "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";

export async function POST(req: Request) {
  await connectDB();

  try {
    console.log("✅ Received Request for Lesson Generation");

    const { topicId, content, depth, aiModel } = await req.json();
    console.log("➡️ Data received:", { topicId, content, depth, aiModel });

    if (!topicId || !content || !depth || !aiModel) {
      console.log(" Invalid input data");
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      console.log(" Topic not found");
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    let extractedText = "";
    if (Array.isArray(content)) {
      console.log("📂 Multiple file inputs detected. Extracting text from each...");
      for (const filePath of content) {
        const fileRes = await fetch(`http://localhost:3000/api/files/read?filePath=${encodeURIComponent(filePath)}`);
        const fileData = await fileRes.json();
        if (fileData.success && fileData.content) {
          extractedText += "\n\n" + fileData.content;
        } else {
          console.error(` Failed to extract content from ${filePath}`);
        }
      }
    } else if (typeof content === "string" && content.startsWith("/uploads/")) {
      console.log("📂 Single file input. Extracting text...");
      const fileRes = await fetch(`http://localhost:3000/api/files/read?filePath=${encodeURIComponent(content)}`);
      const fileData = await fileRes.json();
      if (fileData.success && fileData.content) {
        extractedText = fileData.content;
      } else {
        console.error(" Failed to extract content from file.");
        return NextResponse.json({ error: "Failed to read file content." }, { status: 500 });
      }
    } else {
      extractedText = content;
    }

    console.log("🧠 Extracted Text Preview:", extractedText.substring(0, 500));

    let usedAI = "";
    let sectionResponseData: string = "[]";
    const sectionPrompt = `
      You are an AI tutor. Analyze the following content and determine how to split it into multiple sections based on its complexity.
      If the content is too difficult, split it into more parts with detailed explanations.
      If it is simple, divide it into 2-3 parts for a concise overview.

      Topic Content:
      ${extractedText}

      Provide a list of sections in this format: ["Section 1", "Section 2", "Section 3", ...]
      Only return the section list.
    `;

    async function callOpenRouter(model: string, prompt: string | { role: string; content: any }[]) {
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
          messages: Array.isArray(prompt)
            ? prompt
            : [{ role: "user", content: prompt }],
        }),
      });
      const json = await res.json();
      return json.choices?.[0]?.message?.content || "";
    }

    if (aiModel === "llama") {
      usedAI = "Llama";
      sectionResponseData = await callOpenRouter(
        "meta-llama/llama-4-scout",
        [{ role: "user", content: [{ type: "text", text: sectionPrompt }] }]
      );
    } else if (aiModel === "gemini") {
      usedAI = "Gemini";
      sectionResponseData = await callOpenRouter(
        "google/gemini-2.0-flash-001",
        [{ role: "user", content: [{ type: "text", text: sectionPrompt }] }]
      );
    } else if (aiModel === "deepseek") {
      usedAI = "Deepseek";
      sectionResponseData = await callOpenRouter("deepseek/deepseek-chat-v3-0324", sectionPrompt);
    } else {
      usedAI = "OpenRouter GPT";
      sectionResponseData = await callOpenRouter("openai/gpt-4o", sectionPrompt);
    }

    const jsonMatch = sectionResponseData.match(/```json\s*([\s\S]*?)\s*```/i);
    const jsonString = jsonMatch
      ? jsonMatch[1].trim()
      : sectionResponseData.replace(/```/g, "").trim();

    let sections: string[];
    try {
      sections = JSON.parse(jsonString);
      if (!Array.isArray(sections) || sections.length === 0) {
        throw new Error("Response is not a valid JSON array");
      }
    } catch (error) {
      console.error(" Error parsing sections:", error);
      return NextResponse.json(
        { error: "Failed to generate sections due to AI response format." },
        { status: 500 }
      );
    }

    console.log(`✅ Sections Generated (${usedAI}): ${sections.length}`);

    const lessons: string[] = [];
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
        lessonContent = await callOpenRouter(
          "meta-llama/llama-4-scout",
          [{ role: "user", content: [{ type: "text", text: lessonPrompt }] }]
        );
      } else if (aiModel === "gemini") {
        lessonContent = await callOpenRouter(
          "google/gemini-2.0-flash-001",
          [{ role: "user", content: [{ type: "text", text: lessonPrompt }] }]
        );
      } else if (aiModel === "deepseek") {
        lessonContent = await callOpenRouter("deepseek/deepseek-chat-v3-0324", lessonPrompt);
      } else {
        lessonContent = await callOpenRouter("openai/gpt-4o", lessonPrompt);
      }

      const lesson = new Lesson({
        topicId,
        lessonNumber: i + 1,
        title: `Lesson ${i + 1}: ${sections[i]}`,
        content: lessonContent,
      });
      await lesson.save();
      lessons.push(lesson._id.toString());
    }

    topic.lessons = lessons;
    topic.totalLessons = lessons.length;
    await topic.save();

    console.log(`✅ Lessons Generated Successfully using ${usedAI} API.`);
    return NextResponse.json({ success: true, lessons });
  } catch (error) {
    console.error(" Lesson Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate lessons." }, { status: 500 });
  }
}
