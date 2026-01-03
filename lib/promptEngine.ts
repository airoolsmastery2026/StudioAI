export const generateSafePrompt = (basePrompt: string, additionalContext?: string): string => {
  const safetyConstraints = [
    "locked camera",
    "no people",
    "no text",
    "no watermark",
    "high fidelity",
    "cinematic lighting"
  ];

  const contextPart = additionalContext ? `, ${additionalContext}` : "";
  const constraintPart = safetyConstraints.join(", ");

  // Ensure prompt structure is consistent
  return `${basePrompt}${contextPart}. Style: ${constraintPart}.`;
};

export const validatePrompt = (prompt: string): boolean => {
  const forbiddenTerms = ['nsfw', 'nude', 'violence', 'blood', 'text', 'watermark'];
  const lowerPrompt = prompt.toLowerCase();
  
  return !forbiddenTerms.some(term => lowerPrompt.includes(term));
};
