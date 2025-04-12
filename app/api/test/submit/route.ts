// /app/api/test/submit/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Test from "@/models/Test";
import Lesson from "@/models/Lesson";
import Topic from "@/models/Topic";
import { auth } from "@/auth";
import OpenAI from "openai";

// Instantiate OpenAI client for GPT responses (hardcoded API key)
const openai = new OpenAI({
  apiKey:
    "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",
});

// Hardcoded API key for external models via OpenRouter (used for Llama, Gemini, Deepseek)
const openRouterApiKey =
  "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";

export async function POST(req: Request) {
  await connectDB();

  try {
    console.log("✅ Received test submission request");

    const session = await auth();
    if (!session || !session.user?.email) {
      console.error("❌ Unauthorized user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🟢 Authenticated user:", session.user.email);

    const body = await req.json();
    console.log("📥 Received data:", body);

    const { testId, lessonId, userAnswers } = body;
    if (!testId || !lessonId || !Array.isArray(userAnswers)) {
      console.error("❌ Invalid input data", { testId, lessonId, userAnswers });
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    const test = await Test.findById(testId);
    if (!test) {
      console.error("❌ Test not found:", testId);
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      console.error("❌ Lesson not found:", lessonId);
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Retrieve the topic to get the chosen AI model for evaluation
    const topic = await Topic.findById(lesson.topicId);
    if (!topic) {
      console.error("❌ Topic not found for lesson:", lessonId);
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }
    const chosenModel = topic.aiModel || "gpt";
    console.log("Chosen AI model for evaluation:", chosenModel);

    // Calculate score for MCQ questions and evaluate theory/practical answers
    let score = 0;
    const mcqWeight = 5;
    const theoryAndPracticalFeedback: any[] = [];

    for (let i = 0; i < test.questions.length; i++) {
      const question = test.questions[i];
      const userAnswer = userAnswers[i];

      // For MCQs: compare the answer indices
      if (question.type === "mcq") {
        const correctIndex = test.correctAnswers[i];
        if (userAnswer === correctIndex) {
          score += mcqWeight;
        }
      }

      // For theory or practical questions: Evaluate using the chosen model
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

        let parsedEval: { feedback: string; score: number } = { feedback: "", score: 0 };

        try {
          let rawEval = "";
          if (chosenModel === "llama") {
            console.log(`Using Llama API for evaluating question ${i}.`);
            const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${openRouterApiKey}`,
                "HTTP-Referer": "https://your-site-url.com",
                "X-Title": "YourSiteName",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "meta-llama/llama-4-scout",
                messages: [{ role: "user", content: evaluationPrompt }],
              }),
            });
            const data = await resp.json();
            rawEval = data.choices?.[0]?.message?.content || "{}";
          } else if (chosenModel === "gemini") {
            console.log(`Using Gemini API for evaluating question ${i}.`);
            const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${openRouterApiKey}`,
                "HTTP-Referer": "https://your-site-url.com",
                "X-Title": "YourSiteName",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-pro-preview-03-25",
                messages: [{ role: "user", content: evaluationPrompt }],
              }),
            });
            const data = await resp.json();
            rawEval = data.choices?.[0]?.message?.content || "{}";
          } else if (chosenModel === "deepseek") {
            console.log(`Using Deepseek API for evaluating question ${i}.`);
            const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${openRouterApiKey}`,
                "HTTP-Referer": "https://your-site-url.com",
                "X-Title": "YourSiteName",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "deepseek/deepseek-chat-v3-0324",
                messages: [{ role: "user", content: evaluationPrompt }],
              }),
            });
            const data = await resp.json();
            rawEval = data.choices?.[0]?.message?.content || "{}";
          } else {
            console.log(`Using GPT API for evaluating question ${i}.`);
            const evalRes = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: [{ role: "user", content: evaluationPrompt }],
            });
            rawEval = evalRes.choices[0].message?.content || "{}";
          }

          // Remove backticks and extra characters
          const sanitizedResponse = rawEval.replace(/```json|```/g, "").trim();

          // Parse the response
          try {
            parsedEval = JSON.parse(sanitizedResponse);
          } catch (err) {
            console.error(`❌ Error parsing AI response for question ${i}:`, err);
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
          console.error(`❌ AI Evaluation Error for question ${i}:`, err);
        }
      }
    }

    // Calculate maximum possible score
    const mcqCount = test.questions.filter((q: { type: string }) => q.type === "mcq").length;
    const maxScore = mcqCount * mcqWeight + test.questions.filter((q: { type: string }) => q.type !== "mcq").length * 10;
    const percentage = (score / maxScore) * 100;

    console.log(`📊 Total Score: ${score}/${maxScore} (${percentage.toFixed(2)}%)`);

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

    // Save the test results in the database
    const resultSave = await Test.findByIdAndUpdate(
      testId,
      {
        $set: {
          userAnswers,
          score,
          feedback: theoryAndPracticalFeedback,
          percentage,
        },
      },
      { new: true }
    );

    // Update the lesson's average score
    const allTestResults = await Test.find({ lessonId });
    if (allTestResults.length > 0) {
      const total = allTestResults.reduce((acc: number, t: any) => acc + (t.percentage || 0), 0);
      const averageScore = total / allTestResults.length;
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
    console.error("❌ Test Submission Error:", error);
    return NextResponse.json({ error: "Failed to submit test." }, { status: 500 });
  }
}
