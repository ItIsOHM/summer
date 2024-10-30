import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { text } = await req.json();
  try {
    const stream = new ReadableStream({
      async start(controller) {
        const response = await openai.chat.completions.create({
          model: "google/gemma-2-27b-it:free",
          messages: [
            {
              role: "system",
              content:
                "You are a tool that summarizes text and performs detailed sentimental analysis of the text. This tool is a web appliation that extracts text from a document or an article or is given plain text and produces a formatted list of the ideas in the given text. Do not communicate with the user directly. Give a detailed but brief analysis of the text. This application allows users to upload text content (articles, documents, emails, etc.) and receive a summarized version with key insights and analysis.",
            },
            {
              role: "user",
              content: `text:\n${text}`,
            },
          ],
          temperature: 0.2,
          stream: true,
        });

        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(new TextEncoder().encode(content));
        }

        controller.close();
      },
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain" } });
  } catch (error) {
    return NextResponse.json(
      { error: "Error generating summary" },
      { status: 500 }
    );
  }
}
