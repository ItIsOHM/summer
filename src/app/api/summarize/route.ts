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
            "You are a tool that summarizes text. This tool is a web appliation that extracts text from a document and produces a formatted list of the main points in the given text. Do not communicate with the user directly. Give a brief overview of the text.",
        },
        {
          role: "user",
          content: `text:\n${text}`,
        },
      ],
      temperature: 0.5,
    });

    const summary = response.choices[0]?.message || "No summary available.";
    const content = summary.content;
    // console.log(response.choices[0].message);
    
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