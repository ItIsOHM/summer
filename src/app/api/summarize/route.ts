import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { text } = await req.json();
  try {
    const response = await openai.chat.completions.create({
      model: "google/gemma-7b-it:free",
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
    });

    const summary = response.choices[0]?.message || "No summary available.";
    const content = summary.content;
    
    return NextResponse.json({
      content
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error generating summary" },
      { status: 500 }
    );
  }
}