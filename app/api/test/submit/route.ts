export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Test from "@/models/Test";
import Lesson from "@/models/Lesson";
import Topic from "@/models/Topic";
import { auth } from "@/auth";

const openrouterApiKey = process.env.OPENROUTER_API_KEY!;

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
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "{}";
}

export async function POST(req: Request) {
  await connectDB();

  try {
    console.log("✅ Received test submission request");

    const session = await auth();
    if (!session?.user?.email) {
      console.error(" Unauthorized user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("🟢 Authenticated user:", session.user.email);

    const { testId, lessonId, userAnswers } = await req.json();
    if (!testId || !lessonId || !Array.isArray(userAnswers)) {
      console.error(" Invalid input data", { testId, lessonId, userAnswers });
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    const test = await Test.findById(testId);
    if (!test) {
      console.error(" Test not found:", testId);
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      console.error(" Lesson not found:", lessonId);
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const topic = await Topic.findById(lesson.topicId);
    if (!topic) {
      console.error(" Topic not found for lesson:", lessonId);
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }
    const chosenModel = topic.aiModel || "gpt";
    console.log("▶️  Chosen AI model for evaluation:", chosenModel);

    let score = 0;
    const mcqWeight = 5;
    const theoryAndPracticalFeedback: Array<{
      index: number;
      type: string;
      question: string;
      feedback: string;
      score: number;
    }> = [];

    for (let i = 0; i < test.questions.length; i++) {
      const question = test.questions[i];
      const userAnswer = userAnswers[i];

      if (question.type === "mcq") {
        const correctIndex = test.correctAnswers[i];
        if (userAnswer === correctIndex) {
          score += mcqWeight;
        }
      }

      if (question.type === "theory" || question.type === "practical") {
        const evaluationPrompt = `
      You are a tutor evaluating a student's answer.
      Lesson Content:
      ${lesson.content}
      Question Type: ${question.type}
      Question: ${question.question}
      Expected Answer:
      ${question.correctAnswer}
      Student's Answer:
      ${userAnswer}
      Evaluate how accurate the student's answer is. Provide:
      - feedback (1-2 sentences)
      - a score from 0 to 10
      - If the student didn't know the answer, show the correct answer and explain it.
      - If the student provided a partial answer, point out what they missed and explain why it's important.
      - If the student gave a correct answer, point out the strengths of their answer.
      Respond ONLY in this JSON format:
      {
        "feedback": "your feedback here",
        "score": number
      }
        `.trim();

        let parsedEval = { feedback: "", score: 0 };

        try {
          let rawEval = "";
          if (chosenModel === "llama") {
            console.log(`🦙  Evaluating with Llama (FREE) for question ${i}`);
            rawEval = await callOpenRouter(
              "meta-llama/llama-3.3-70b-instruct:free",
              evaluationPrompt
            );
          } else if (chosenModel === "gemini") {
            console.log(`✨  Evaluating with Gemini (FREE) for question ${i}`);
            rawEval = await callOpenRouter(
              "google/gemini-2.0-flash-exp:free",
              evaluationPrompt
            );
          } else if (chosenModel === "deepseek") {
            console.log(`🐉  Evaluating with Deepseek (FREE) for question ${i}`);
            rawEval = await callOpenRouter(
              "tngtech/deepseek-r1t2-chimera:free",
              evaluationPrompt
            );
          } else {
            console.log(`🤖  Evaluating with GPT OSS (FREE) for question ${i}`);
            rawEval = await callOpenRouter(
              "openai/gpt-oss-20b:free",
              evaluationPrompt
            );
          }


          const sanitized = rawEval.replace(/```json|```/g, "").trim();
          try {
            parsedEval = JSON.parse(sanitized);
          } catch (err) {
            console.error(` Error parsing AI response for question ${i}:`, err);
            parsedEval = { feedback: "Error parsing feedback", score: 0 };
          }

          score += parsedEval.score || 0;
          theoryAndPracticalFeedback.push({
            index: i,
            type: question.type,
            question: question.question,
            feedback: parsedEval.feedback,
            score: parsedEval.score,
          });
        } catch (err) {
          console.error(` AI Evaluation Error for question ${i}:`, err);
        }
      }
    }

    // Calculate max and percentage
    const mcqCount = test.questions.filter((q: { type: string; }) => q.type === "mcq").length;
    const maxScore =
      mcqCount * mcqWeight +
      test.questions.filter((q: { type: string; }) => q.type !== "mcq").length * 10;
    const percentage = (score / maxScore) * 100;

    console.log(`📊 Total Score: ${score}/${maxScore} (${percentage.toFixed(2)}%)`);

    // Persist feedback and score
    const testResult = {
      userId: session.user.email,
      lessonId,
      userAnswers,
      correctAnswers: test.correctAnswers,
      feedback: theoryAndPracticalFeedback,
      score,
      percentage,
      createdAt: new Date(),
    };

    await Test.findByIdAndUpdate(
      testId,
      {
        userAnswers,
        score,
        feedback: theoryAndPracticalFeedback,
        percentage,
      },
      { new: true }
    );

    // Update lesson average score
    const allResults = await Test.find({ lessonId });
    if (allResults.length) {
      const totalPct = allResults.reduce((sum, t) => sum + (t.percentage || 0), 0);
      const averageScore = totalPct / allResults.length;
      await Lesson.findByIdAndUpdate(lessonId, { averageScore });
      console.log("📊 Lesson average updated:", averageScore);
    }

    return NextResponse.json({
      success: true,
      testResult,
      score: percentage,
      feedback: theoryAndPracticalFeedback,
    });

  } catch (error) {
    console.error(" Test Submission Error:", error);
    return NextResponse.json({ error: "Failed to submit test." }, { status: 500 });
  }
}
