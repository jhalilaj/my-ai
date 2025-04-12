// app/api/generate-test/route.ts
export const runtime = "nodejs"; // Ensure we're using the Node.js runtime

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Test from "@/models/Test";
import Lesson from "@/models/Lesson";

export async function POST(req: Request) {
  // Connect to MongoDB
  await connectDB();

  try {
    // Parse the POST JSON body and extract lessonId
    const { lessonId } = await req.json();

    if (!lessonId) {
      console.error("❌ Missing lessonId");
      return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
    }

    // Check if the lesson exists in the DB
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      console.error("❌ Lesson not found for lessonId:", lessonId);
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Build the prompt to generate test questions from lesson content
    const prompt = `
Analyze the lesson content and decide how many of each type of question to generate. Generate the questions accordingly:
    
- Multiple Choice Questions (MCQs): Generate at least 2 MCQs, but if the content is more factual or has clear answers, generate 3 or 4.
- Theoretical Questions: If the content is more concept-based or requires detailed explanations, generate 2 or more theoretical questions.
- Practical Questions: If the content involves code examples, algorithms, or implementation tasks, generate at least 1 practical question.
    
The questions should follow the structure below:
- "type": "mcq" | "theory" | "practical"
- "question": the actual question
- "options": (only for mcq, an array of 4 options)
- "correctAnswer": "A"/"B"/"C"/"D" for mcq, or a sample answer for theory/practical
    
Here is the lesson content:
${lesson.content}

Generate the questions based on the content.

Return the test as a JSON array. Each object must include:
- "type": "mcq" | "theory" | "practical"
- "question": the actual question
- "options": (only for mcq, an array of 4 options)
- "correctAnswer": "A"/"B"/"C"/"D" for mcq, or a sample answer for theory/practical

Example:
  {
    "type": "mcq",
    "question": "Which of the following is true about the Java Virtual Machine (JVM)?",
    "options": ["JVM is the hardware part of a computer.", "JVM interprets and executes Java bytecode.", "JVM is used to compile Java programs.", "JVM is only available on Windows operating systems."],
    "correctAnswer": "B"
  },
  {
    "type": "mcq",
    "question": "Which method is considered the entry point of any Java application?",
    "options": ["public void start()", "public static void main(String[] args)", "public static void begin(String[] args)", "public main()"],
    "correctAnswer": "B"
  },
  {
    "type": "theory",
    "question": "Explain the importance of the main method in Java.",
    "correctAnswer": "The main method is the entry point for any Java application. It is the method invoked by the Java Virtual Machine to start the execution of the program."
  },
  {
    "type": "practical",
    "question": "Write a Java program to check whether a number is prime.",
    "correctAnswer": "public class PrimeCheck { public static void main(String[] args) { int num = 11; boolean isPrime = true; for (int i = 2; i <= num / 2; i++) { if (num % i == 0) { isPrime = false; break; } } System.out.println(isPrime ? 'Prime' : 'Not Prime'); } }"
  }
    `.trim();

    // Call the OpenRouter API (which uses the Llama model) via fetch
    const openrouterApiKey = "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";
    const routerResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openrouterApiKey}`,
        "HTTP-Referer": "https://your-site-url.com", // Optional; replace with your actual site URL
        "X-Title": "YourSiteName", // Optional; replace with your site name
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout:free", // Use the Llama model
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              }
              // For this prompt, we're sending text only. If needed, you can include additional content objects.
            ],
          },
        ],
      }),
    });

    const routerData = await routerResponse.json();

    // Expecting a similar response format to OpenAI; extract the raw message content.
    let rawResponse = routerData.choices?.[0]?.message?.content || "[]";
    console.log("Raw AI Response:", rawResponse);

    // Extract only the JSON portion from within triple backticks.
    const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/i);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : rawResponse.replace(/```/g, "").trim();

    let parsedTest;
    try {
      parsedTest = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("❌ AI Response Parsing Error:", parseError);
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    // Verify that sufficient questions have been generated
    if (!parsedTest || parsedTest.length < 2) {
      console.error("❌ Insufficient questions generated:", parsedTest);
      return NextResponse.json({ error: "Failed to generate sufficient questions" }, { status: 500 });
    }

    // Save the generated test to your database
    const test = new Test({
      lessonId,
      questions: parsedTest.map((q: { type: any; question: any; options: any; correctAnswer: any; }) => ({
        type: q.type,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
      })),
      correctAnswers: parsedTest.map((q: { type: string; correctAnswer: string; }) => {
        // For multiple choice, convert "A"/"B"/"C"/"D" to an index; otherwise, set as null.
        return q.type === "mcq" ? ["A", "B", "C", "D"].indexOf(q.correctAnswer) : null;
      }),
    });

    await test.save();

    return NextResponse.json({ success: true, test });
  } catch (error) {
    console.error("❌ Test Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
