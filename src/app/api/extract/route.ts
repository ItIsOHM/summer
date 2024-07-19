import { NextResponse } from "next/server";
import { extract } from "@extractus/article-extractor";
import { getTextExtractor } from "office-text-extractor";
import FormData from "form-data";

export async function POST(req: Request) {
  try {
    if (req.headers.get("content-type")?.includes("application/json")) {
      const { url } = await req.json();
      const text = await extract(url);
      const content = text?.content;
      const {convert} = require("html-to-text")
      const extractedText = convert(content)
      return NextResponse.json({ extractedText });
    } else if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as Blob;

      if (!file) {
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const textExtractor = getTextExtractor();
      const text = await textExtractor.extractText({
        input: buffer,
        type: "buffer"
      });
      
      return NextResponse.json({ content: text });
    } else {
      return NextResponse.json({ error: "Invalid content type." }, { status: 400 });
    }
  } catch (error) {
    console.error("Error parsing text:", error);
    return NextResponse.json({ error: "Error parsing text." }, { status: 500 });
  }
}
