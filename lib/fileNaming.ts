export const generateVideoFilename = (index: number, intent: string, model: string): string => {
  const sanitizedIntent = intent.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
  const sanitizedModel = model.toLowerCase().replace(/[^a-z0-9]/g, '');
  const timestamp = new Date().toISOString().split('T')[0];
  
  return `${timestamp}_${index}_${sanitizedIntent}_${sanitizedModel}.mp4`;
};
