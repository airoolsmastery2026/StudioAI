import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { DEFAULT_DNA } from '@/lib/visualDNA';

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!process.env.API_KEY) {
      console.warn("API_KEY missing, using mock analysis");
      // Fallback for demo without key
      return NextResponse.json({ dna: DEFAULT_DNA });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Analyze this video description and extract its "Visual DNA" into valid JSON.
      Do NOT add markdown formatting.
      Description: "${description}"
      
      Required JSON Structure:
      {
        "duration": "string",
        "aspectRatio": "string",
        "cameraType": "string",
        "lightingFlow": "string",
        "motionStyle": "string",
        "pacing": "string",
        "colorGrade": "string"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    const text = response.text || "";
    
    // Cleanup json
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const dna = JSON.parse(cleanText);

    return NextResponse.json({ dna });

  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}