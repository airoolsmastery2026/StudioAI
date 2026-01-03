import { VisualDNA } from '@/types';

export const convertDNAToPrompt = (dna: VisualDNA, description: string): string => {
  return `
    Scene: ${description}.
    Visual Structure:
    - Camera: ${dna.cameraType}
    - Lighting: ${dna.lightingFlow}
    - Motion: ${dna.motionStyle}
    - Pacing: ${dna.pacing}
    - Color: ${dna.colorGrade}
    - Aspect Ratio: ${dna.aspectRatio}
  `.trim().replace(/\s+/g, ' ');
};
