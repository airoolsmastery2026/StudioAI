import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, metadata } = body;

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_API_KEY is missing");
      return NextResponse.json(
        { error: "Server misconfiguration: API Key missing" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
Analyze this video concept for a professional film studio.
Concept: "${description}".
Target Duration: ${metadata?.duration || 5}s.

Extract the visual DNA structure. Return ONLY a valid JSON object.
Required Keys:
- cameraType (e.g. "Static Tripod", "Dolly In", "Slow Pan")
- lightingFlow (e.g. "Natural Day", "Golden Hour", "Cinematic Night")
- motionStyle (e.g. "Subtle", "Dynamic", "Slow Motion")
- pacing (e.g. "Slow", "Medium", "Fast")
- colorGrade (e.g. "Neutral", "Warm", "Cool", "Vintage")
- aspectRatio (e.g. "16:9", "2.35:1")

Do not wrap in markdown code blocks. Return raw JSON.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Empty response from AI model");
    }

    // Sanitize output in case the model adds markdown
    const cleanJson = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return NextResponse.json(JSON.parse(cleanJson));
  } catch (err: any) {
    console.error("Analysis API Error:", err);
    return NextResponse.json(
      { error: "Failed to analyze video concept." },
      { status: 500 }
    );
  }
}