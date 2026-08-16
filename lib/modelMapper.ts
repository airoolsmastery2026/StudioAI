
import { ModelSpec } from '@/types';
import { IVideoModelAdapter } from './models/BaseModelAdapter';
import { KlingAdapter } from './models/KlingAdapter';
import { RunwayAdapter } from './models/RunwayAdapter';
import { WanAdapter } from './models/WanAdapter';
import { Veo3Adapter } from './models/Veo3Adapter';
import { Sora2Adapter } from './models/Sora2Adapter';
import { GrokAdapter } from './models/GrokAdapter';

export const AVAILABLE_MODELS: ModelSpec[] = [
  {
    id: 'runway',
    name: 'Runway Gen-3',
    provider: 'RunwayML',
    maxDuration: 16,
    capabilities: ['realistic', 'cinematic', 'reliable'],
    costFactor: 1.0,
    tier: 'professional',
    supportsAudio: false
  },
  {
    id: 'kling',
    name: 'Kling AI 1.0',
    provider: 'Kling',
    maxDuration: 10,
    capabilities: ['hyper-realistic', 'human-motion'],
    costFactor: 1.2,
    tier: 'professional',
    supportsAudio: false
  },
  {
    id: 'veo3',
    name: 'Veo 3',
    provider: 'Google',
    maxDuration: 60,
    capabilities: ['long-form', '1080p', 'consistent'],
    costFactor: 1.5,
    tier: 'enterprise',
    supportsAudio: true
  },
  {
    id: 'sora2',
    name: 'Sora 2.0',
    provider: 'OpenAI',
    maxDuration: 60,
    capabilities: ['physics-sim', 'complex-motion', '60fps'],
    costFactor: 2.5,
    tier: 'enterprise',
    supportsAudio: false
  },
  {
    id: 'wan',
    name: 'Wan Video',
    provider: 'Wan AI',
    maxDuration: 5,
    capabilities: ['high-action', 'dynamic-camera'],
    costFactor: 0.8,
    tier: 'consumer',
    supportsAudio: false
  },
  {
    id: 'grok',
    name: 'Grok Vision',
    provider: 'xAI',
    maxDuration: 10,
    capabilities: ['spatial-understanding', 'meme-ready'],
    costFactor: 1.1,
    tier: 'consumer',
    supportsAudio: false
  }
];

const adapterCache: Record<string, IVideoModelAdapter> = {};

export const getModelAdapter = (modelId: string): IVideoModelAdapter | null => {
  const normalizedId = modelId === 'veo' ? 'veo3' : modelId;
  if (adapterCache[normalizedId]) return adapterCache[normalizedId];

  let adapter: IVideoModelAdapter | null = null;
  switch (normalizedId) {
    case 'kling': adapter = new KlingAdapter(); break;
    case 'runway': adapter = new RunwayAdapter(); break;
    case 'wan': adapter = new WanAdapter(); break;
    case 'veo3': adapter = new Veo3Adapter(); break;
    case 'sora2': adapter = new Sora2Adapter(); break;
    case 'grok': adapter = new GrokAdapter(); break;
    default: return null;
  }

  adapterCache[normalizedId] = adapter;
  return adapter;
};

export const isModelCompatible = (modelId: string, allowedModels: string[]): boolean => {
  const normalizedId = modelId === 'veo' ? 'veo3' : modelId;
  const normalizedAllowed = allowedModels.map(m => m === 'veo' ? 'veo3' : m);
  return normalizedAllowed.includes(normalizedId);
};

export const getCompatibleModelsForTemplate = (allowedModels: string[]): ModelSpec[] => {
  const normalizedAllowed = allowedModels.map(m => m === 'veo' ? 'veo3' : m);
  const models = AVAILABLE_MODELS.filter(m => normalizedAllowed.includes(m.id));
  return models.sort((a, b) => normalizedAllowed.indexOf(a.id) - normalizedAllowed.indexOf(b.id));
};
