import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DEFAULT_DNA } from "@/lib/visualDNA";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    // Fallback mode (no API key → demo / safe mode)
    if (!process.env.GOOGLE_API_KEY) {
      console.warn("GOOGLE_API_KEY missing, using DEFAULT_DNA");
      return NextResponse.json({ dna: DEFAULT_DNA });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
Analyze the following video description and extract its Visual DNA.

Description:
"${description}"

Return a VALID JSON object with EXACTLY these keys:
{
  "duration": "string",
  "aspectRatio": "string",
  "cameraType": "string",
  "lightingFlow": "string",
  "motionStyle": "string",
  "pacing": "string",
  "colorGrade": "string"
}

Rules:
- Return RAW JSON ONLY
- No markdown
- No explanation
`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    const rawText = response.text() ?? "";
    if (!rawText) {
      throw new Error("Empty response from Gemini model");
    }

    const cleanText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const dna = JSON.parse(cleanText);

    return NextResponse.json({ dna });
  } catch (error) {
    console.error("Analyze-video error:", error);
    return NextResponse.json(
      { error: "Failed to analyze video description" },
      { status: 500 }
    );
  }
}
