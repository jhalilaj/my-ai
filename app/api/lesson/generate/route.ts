import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lesson from "@/models/Lesson";
import Topic from "@/models/Topic";
import OpenAI from "openai";

// ✅ Use environment variable for security
const openai = new OpenAI({
    apiKey: XXXXsk-proj-wKOSjzWTjpkdjsM76Syqaw4nEuLrP3GmQ5svm6AuH-_c2sRJqyPBI50vYTVjKm8TdXnwsk6QjoT3BlbkFJdotkdG3oRYFa_Lfi63HiFoDT42DPdugxMCoEC1GW_Xh2ItfTaMFSHP_WDeenHRlF-XmNVK644A',
});


export async function POST(req: Request) {
    await connectDB();

    try {
        console.log("✅ Received Request for Lesson Generation");

        // ✅ Parse request JSON safely
        const { topicId, content, depth } = await req.json();
        console.log("➡️ Data received:", { topicId, content, depth });

        if (!topicId || !content || !depth) {
            console.log(" Invalid input data");
            return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
        }

        // ✅ Validate if Topic exists
        const topic = await Topic.findById(topicId);
        if (!topic) {
            console.log(" Topic not found");
            return NextResponse.json({ error: "Topic not found" }, { status: 404 });
        }

        // ✅ Handle file-based content
        let extractedText = content;
        if (content.startsWith("/uploads/")) {
            console.log("📂 Detected file input. Extracting text...");
            const fileRes = await fetch(`http://localhost:3000/api/files/read?filePath=${encodeURIComponent(content)}`);

            const fileData = await fileRes.json();

            if (fileData.success && fileData.content) {
                extractedText = fileData.content;
            } else {
                console.error(" Failed to extract text from file.");
                return NextResponse.json({ error: "Failed to read file content." }, { status: 500 });
            }
        }

        console.log(" Extracted Text:", extractedText.substring(0, 500)); // Show first 500 chars

        console.log("Calling OpenAI to split topic into sections...");
        const sectionPrompt = `
          You are an AI tutor. Analyze the following topic and divide it into ${depth} major sections that best cover the subject.
          Topic Content: ${extractedText}
          Format the response strictly as a JSON array: ["Section 1", "Section 2", ...].
        `;

        const sectionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: sectionPrompt }],
        });

        // ✅ Ensure OpenAI response is valid JSON
        let sections;
        try {
            console.log("📥 OpenAI Response:", sectionResponse.choices[0]?.message?.content);
            // ✅ Sanitize OpenAI response to remove markdown backticks
            const rawResponse = sectionResponse.choices[0]?.message?.content || "[]";
            const sanitizedResponse = rawResponse.replace(/```json|```/g, "").trim();

            console.log("📥 Sanitized OpenAI Response:", sanitizedResponse);

            sections = JSON.parse(sanitizedResponse);


            if (!Array.isArray(sections) || sections.length === 0) {
                throw new Error("OpenAI response is not a valid JSON array.");
            }
        } catch (error) {
            console.error(" Error parsing OpenAI response:", error);
            return NextResponse.json({ error: "Failed to generate sections due to OpenAI response format." }, { status: 500 });
        }

        console.log(`✅ Sections Generated: ${sections.length}`);

        let lessons = [];

        for (let i = 0; i < sections.length; i++) {
            console.log(`📝 Generating Lesson ${i + 1}: ${sections[i]}`);
            const lessonPrompt = `
                You are an expert AI tutor. Generate a full structured lesson on "${sections[i]}" from the given topic content.
                The lesson should include:
                - Introduction
                - Key Concepts
                - Detailed Explanation
                - Real-world Examples
                - Summary
                Topic Content: ${extractedText}
            `;

            const lessonResponse = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: lessonPrompt }],
            });

            const lessonContent = lessonResponse.choices[0]?.message?.content || "";

            // ✅ Save lesson to MongoDB
            const lesson = new Lesson({
                topicId,
                lessonNumber: i + 1,
                title: `Lesson ${i + 1}: ${sections[i]}`,
                content: lessonContent,
            });

            await lesson.save();
            lessons.push(lesson._id);
        }

        // ✅ Update Topic with Generated Lessons
        topic.lessons = lessons;
        topic.totalLessons = lessons.length;
        await topic.save();

        console.log("✅ Lessons Generated Successfully");
        return NextResponse.json({ success: true, lessons });
    } catch (error) {
        console.error(" Lesson Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate lessons." }, { status: 500 });
    }
}
