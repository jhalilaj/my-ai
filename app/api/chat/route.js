import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: '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',
});


export async function POST(request) {
    try {
      const { prompt } = await request.json();
      console.log("Received Prompt:", prompt);
  
      // **Fix: More Accurate Image Detection**
      const isImageRequest = /generate an image|show me an image|create an image/i.test(prompt);
  
      if (isImageRequest) {
        console.log("Generating an image...");
  
        try {
          const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt,
            n: 1,
            size: "1024x1024",
          });
  
          console.log("OpenAI Image Response:", JSON.stringify(imageResponse, null, 2));
  
          if (imageResponse?.data?.[0]?.url) {
            return NextResponse.json({ image: imageResponse.data[0].url });
          } else {
            console.error("No image URL returned from OpenAI");
            return NextResponse.json({ error: "OpenAI did not return an image." }, { status: 500 });
          }
        } catch (imageError) {
          console.error("Image Generation Error:", imageError);
          return NextResponse.json({ error: "Error generating image." }, { status: 500 });
        }
      }
  
      // **Default to GPT-4o for Text Responses**
      console.log("Generating text response...");
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
      });
  
      console.log("OpenAI Text Response:", JSON.stringify(response, null, 2));
  
      const assistantMessage = response.choices[0]?.message?.content || "";
      return NextResponse.json({ message: assistantMessage });
  
    } catch (error) {
      console.error("General API Error:", error);
      return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
  }