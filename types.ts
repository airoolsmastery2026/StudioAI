
export type StudioMode = 'single' | 'batch' | 'clone';

export interface PromptTemplate {
  id: string;
  label: string;
  intent: string;
  basePrompt: string;
  compatibleModels: string[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  templates: PromptTemplate[];
}

export type QualityTier = 'Standard' | 'Pro' | 'Ultra';
export type MotionIntensity = 'Low' | 'Medium' | 'High';
export type RenderPriority = 'Speed' | 'Quality';

export interface GenerationSettings {
  quality: QualityTier;
  motion: MotionIntensity;
  priority: RenderPriority;
  duration?: number;
  aspectRatio?: string;
}

export interface ModelSpec {
  id: string;
  name: string;
  provider: string;
  maxDuration: number;
  capabilities: string[];
  costFactor: number;
  // Adapter configuration flags
  tier: 'consumer' | 'professional' | 'enterprise';
  supportsAudio: boolean;
}

export interface VisualDNA {
  duration: string;
  aspectRatio: string;
  cameraType: string;
  lightingFlow: string;
  motionStyle: string;
  pacing: string;
  colorGrade: string;
}

export type JobStatus = 'pending' | 'processing' | 'done' | 'error';

export interface Job {
  id: string;
  createdAt: number;
  status: JobStatus;
  topicId: string;
  templateId: string;
  modelId: string;
  finalPrompt: string;
  settings?: GenerationSettings;
  resultUrl?: string;
  error?: string;
}

export interface BatchConfig {
  size: number;
  topicId: string;
  templateId: string;
  modelId: string;
}
