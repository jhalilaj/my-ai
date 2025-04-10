import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lesson from "@/models/Lesson";
import Topic from "@/models/Topic";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: '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',
});

export async function POST(req: Request) {
  await connectDB();

  try {
    console.log("✅ Received Request for Lesson Generation");

    const { topicId, content, depth } = await req.json();
    console.log("➡️ Data received:", { topicId, content, depth });

    if (!topicId || !content || !depth) {
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

    // ✅ Generate sections based on content difficulty
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

    const sectionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: sectionPrompt }],
    });

    let sections;
    try {
      const rawResponse = sectionResponse.choices[0]?.message?.content || "[]";
      const sanitizedResponse = rawResponse.replace(/```json|```/g, "").trim();
      sections = JSON.parse(sanitizedResponse);

      if (!Array.isArray(sections) || sections.length === 0) {
        throw new Error("OpenAI response is not a valid JSON array.");
      }
    } catch (error) {
      console.error("❌ Error parsing OpenAI response:", error);
      return NextResponse.json({ error: "Failed to generate sections due to OpenAI response format." }, { status: 500 });
    }

    console.log(`✅ Sections Generated: ${sections.length}`);

    // ✅ Generate lessons for each section
    let lessons = [];

    for (let i = 0; i < sections.length; i++) {
      console.log(`📝 Generating Lesson ${i + 1}: ${sections[i]}`);

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

      const lessonResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: lessonPrompt }],
      });

      const lessonContent = lessonResponse.choices[0]?.message?.content || "";

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

    console.log("✅ Lessons Generated Successfully");
    return NextResponse.json({ success: true, lessons });
  } catch (error) {
    console.error("❌ Lesson Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate lessons." }, { status: 500 });
  }
}
