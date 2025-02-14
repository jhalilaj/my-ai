  import { NextResponse } from "next/server";
  import connectDB from "@/lib/mongodb";
  import Test from "@/models/Test";
  import Lesson from "@/models/Lesson";
  import { auth } from "@/auth";

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
  
      // Log the userAnswers before saving
      console.log("📝 User answers before saving:", userAnswers);
  
      // Retrieve the test from the database
      const test = await Test.findById(testId);
      if (!test) {
        console.error("❌ Test not found:", testId);
        return NextResponse.json({ error: "Test not found" }, { status: 404 });
      }
  
      console.log("🟢 Found test:", test._id);
  
      // ✅ Calculate Score
      let score = 0;
      test.correctAnswers.forEach((correctIndex: number, index: number) => {
        if (userAnswers[index] === correctIndex) {
          score += 1;
        }
      });
  
      const percentage = (score / test.correctAnswers.length) * 100;
      console.log(`📊 Calculated score: ${score}/${test.correctAnswers.length} (${percentage}%)`);
  
      // ✅ Save Test Result
      const newTestResult = {
        userId: session.user.email,
        lessonId,
        userAnswers,
        correctAnswers: test.correctAnswers,
        score,
        percentage,
        createdAt: new Date(),
      };
  
      // Log before saving the test result
      console.log("📝 Saving test result to database...");
      console.log("Test result data:", newTestResult);
  
      // Use $set to explicitly set the userAnswers field instead of $push
      const resultSave = await Test.findByIdAndUpdate(testId, { 
        $set: { "userAnswers": userAnswers, "score": score } 
      }, { new: true });
  
      console.log("✅ Test result saved:", resultSave); // Log the result of the save operation
  
      // ✅ Fetch all test results for this lesson
      const allTestResults = await Test.find({ lessonId });
      if (allTestResults.length > 0) {
        const totalScores = allTestResults.reduce(
          (acc: number, t: { percentage: number }) => acc + (t.percentage || 0),
          0
        );
        const averageScore = totalScores / allTestResults.length;
  
        console.log("📊 Updated lesson average score:", averageScore);
  
        const lessonUpdate = await Lesson.findByIdAndUpdate(lessonId, { averageScore });
        console.log("✅ Lesson average score updated:", lessonUpdate);
      } else {
        console.log("⚠ No previous test results found, skipping average score update.");
      }
  
      console.log("✅ Test submission completed successfully!");
      return NextResponse.json({ success: true, testResult: newTestResult, score: percentage });
    } catch (error) {
      console.error("❌ Test Submission Error:", error);
      return NextResponse.json({ error: "Failed to submit test." }, { status: 500 });
    }
  }
  
