export const generateSafePrompt = (basePrompt: string, additionalContext?: string): string => {
  const safetyConstraints = [
    "locked camera",
    "no people",
    "no text",
    "no watermark",
    "high fidelity",
    "cinematic lighting",
    "8k resolution"
  ];

  // In a real production app, we would sanitize 'additionalContext' against a blacklist here
  const safeContext = additionalContext ? additionalContext.replace(/[^a-zA-Z0-9 ,.-]/g, '') : "";

  const constraintPart = safetyConstraints.join(", ");

  // We strictly format the prompt to ensure the model focuses on aesthetics, not character generation
  return `${basePrompt}. ${safeContext} Style Parameters: ${constraintPart}.`;
};

export const validatePrompt = (prompt: string): boolean => {
  // Strict blacklist for pre-validation (even though users can't type freely, this validates templates)
  const forbiddenTerms = ['nsfw', 'nude', 'violence', 'blood', 'text', 'watermark', 'politics', 'celebrity'];
  const lowerPrompt = prompt.toLowerCase();
  
  return !forbiddenTerms.some(term => lowerPrompt.includes(term));
};