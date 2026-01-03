import { ModelSpec } from '@/types';

export const AVAILABLE_MODELS: ModelSpec[] = [
  {
    id: 'runway',
    name: 'Runway Gen-2',
    provider: 'RunwayML',
    maxDuration: 16,
    capabilities: ['realistic', 'cinematic'],
    costFactor: 1.0
  },
  {
    id: 'pika',
    name: 'Pika Labs',
    provider: 'Pika',
    maxDuration: 3,
    capabilities: ['animation', 'stylized'],
    costFactor: 0.8
  },
  {
    id: 'luma',
    name: 'Luma Dream Machine',
    provider: 'Luma',
    maxDuration: 5,
    capabilities: ['3d-consistent', 'fast'],
    costFactor: 1.2
  },
  {
    id: 'veo',
    name: 'Google Veo',
    provider: 'Google',
    maxDuration: 60,
    capabilities: ['long-form', '1080p'],
    costFactor: 1.5
  },
  {
    id: 'sora2',
    name: 'Sora 2.0',
    provider: 'OpenAI',
    maxDuration: 60,
    capabilities: ['hyper-realistic', 'complex-motion'],
    costFactor: 2.0
  },
  {
    id: 'grok',
    name: 'Grok Vision',
    provider: 'xAI',
    maxDuration: 10,
    capabilities: ['spatial-understanding'],
    costFactor: 1.1
  }
];

export const isModelCompatible = (modelId: string, allowedModels: string[]): boolean => {
  return allowedModels.includes(modelId);
};

export const getCompatibleModelsForTemplate = (allowedModels: string[]): ModelSpec[] => {
  return AVAILABLE_MODELS.filter(m => allowedModels.includes(m.id));
};
