import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Test from "@/models/Test";
import Lesson from "@/models/Lesson";
import { auth } from "@/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: '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',
});

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

    console.log("🟢 Found test and lesson");

    // ✅ Calculate MCQ score
    let score = 0;
    const mcqWeight = 1;
    const theoryAndPracticalFeedback: any[] = [];

    for (let i = 0; i < test.questions.length; i++) {
      const question = test.questions[i];
      const userAnswer = userAnswers[i];

      if (question.type === "mcq") {
        const correctIndex = test.correctAnswers[i];
        if (userAnswer === correctIndex) score += mcqWeight;
      }

      // Theory or Practical
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

Respond ONLY in this JSON format:
{
  "feedback": "your feedback here",
  "score": number
}
        `.trim();

        try {
          const evalRes = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: evaluationPrompt }],
          });

          const rawEval = evalRes.choices[0].message?.content || "{}";

          // ✅ Remove backticks or any unwanted characters from the response
          const sanitizedResponse = rawEval.replace(/```json|```/g, "").trim();

          // ✅ Parse the cleaned response
          let parsedEval;
          try {
            parsedEval = JSON.parse(sanitizedResponse);
          } catch (err) {
            console.error(`❌ Error parsing AI response for question ${i}:`, err);
            parsedEval = { feedback: "Error parsing feedback", score: 0 }; // Default error feedback
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

    const maxScore =
      test.questions.filter((q: { type: string; }) => q.type === "mcq").length * mcqWeight +
      theoryAndPracticalFeedback.reduce((acc, f) => acc + 10, 0);

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

    // Update lesson's average score
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
