import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Chat from "@/models/Chat";
import Test from "@/models/Test";
import OpenAI from "openai";

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: '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',
});


export async function POST(req: Request) {
    await dbConnect();
  
    try {
      const { lessonId, userId } = await req.json();
  
      // Fetch Lesson Content from MongoDB
      const chat = await Chat.findOne({ lessonId, userId });
      if (!chat) {
        console.error("Chat data not found.");
        return NextResponse.json({ error: "Chat data not found." }, { status: 404 });
      }
  
      const lessonContent = chat.messages.map((msg: any) => msg.content).join("\n");
  
      // Send Lesson Content to OpenAI
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI tutor creating tests for programming lessons.",
          },
          {
            role: "user",
            content: `Based on this lesson content, generate a test with:
            - 2 Multiple Choice Questions (with 4 options each),
            - 1 True/False question,
            - 1 Coding question.
            Provide the output as a JSON array of objects with this format:
            [{ "type": "MCQ", "questionText": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "B" }, ...]
            
            Lesson Content:\n\n${lessonContent}`,
          },
        ],
      });
  
      console.log("AI Response:", aiResponse.choices[0].message?.content);
  
      let questions;
      try {
        questions = JSON.parse(aiResponse.choices[0].message?.content || "[]");
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        return NextResponse.json({ error: "Invalid JSON format from AI response." }, { status: 500 });
      }
  
      const generatedTest = {
        lessonId,
        userId,
        questions,
      };
  
      const savedTest = await Test.create(generatedTest);
  
      return NextResponse.json({ message: "Test generated successfully.", test: savedTest }, { status: 201 });
    } catch (error) {
      console.error("Server Error:", error);
      return NextResponse.json({ error: "Failed to generate test." }, { status: 500 });
    }
  }