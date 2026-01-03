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

export interface ModelSpec {
  id: string;
  name: string;
  provider: string;
  maxDuration: number;
  capabilities: string[];
  costFactor: number;
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
  resultUrl?: string;
  error?: string;
}

export interface BatchConfig {
  size: number;
  topicId: string;
  templateId: string;
  modelId: string;
}
