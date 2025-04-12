import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Call to the Llama endpoint using your API key
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "HTTP-Referer": "https://your-site-url.com",  // Replace with your site URL if needed
        "X-Title": "YourSiteName",                    // Replace with your site title if needed
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "What is in this image?"
              },
              {
                type: "image_url",
                image_url: {
                  url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
                }
              }
            ]
          }
        ]
      })
    });

    const data = await res.json();

    return NextResponse.json({ success: true, result: data });
  } catch (err) {
    console.error("❌ Error calling Llama API:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
