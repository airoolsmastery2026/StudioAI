import { VisualDNA } from '@/types';

// In a real implementation, this would call the /api/analyze-video endpoint
// We provide a client-side helper here if needed, but the logic primarily resides in the API
export const parseAnalysisResponse = (jsonString: string): VisualDNA | null => {
  try {
    // Clean potential Markdown code blocks if the LLM adds them
    const cleanStr = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanStr) as VisualDNA;
  } catch (e) {
    console.error("Failed to parse analysis response", e);
    return null;
  }
};
