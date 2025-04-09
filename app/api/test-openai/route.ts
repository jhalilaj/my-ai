import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI API client with API Key
const openai = new OpenAI({
  apiKey: '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',
});

export async function GET() {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4", // Using GPT-4 (ensure you have access to this model)
      messages: [{ role: "user", content: "Say hello" }],
    });

    return NextResponse.json({ success: true, message: res.choices[0].message.content });
  } catch (err) {
    console.error("❌ Error:", err);  // Log the error for better debugging
    return NextResponse.json({ success: false, error: (err as any).message }, { status: 500 });
  }
}
