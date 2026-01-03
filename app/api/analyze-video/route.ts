import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { description, metadata } = await req.json();

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn("GOOGLE_API_KEY is missing in environment variables.");
      return NextResponse.json(
        { error: "Missing GOOGLE_API_KEY" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
Analyze this video concept: "${description}".
Duration: ${metadata?.duration || 5}s.

Return a JSON object with keys:
cameraType, lightingFlow, motionStyle, pacing.
Return RAW JSON only.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    const rawText = response.text() ?? "";
    if (!rawText) {
      throw new Error("Empty model response");
    }

    const cleanJson = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return NextResponse.json(JSON.parse(cleanJson));
  } catch (err: any) {
    console.error("Analysis Error:", err);
    return NextResponse.json(
      { error: "Analyze video failed" },
      { status: 500 }
    );
  }
}