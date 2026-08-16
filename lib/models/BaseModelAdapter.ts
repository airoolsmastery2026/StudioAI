
import { GenerationSettings } from '@/types';

export interface VideoGenerationResult {
  success: boolean;
  url?: string;
  jobId?: string;
  error?: string;
  metadata?: any;
}

export type AdapterExecutionMode = 'live' | 'stub';

export interface IVideoModelAdapter {
  id: string;
  provider: string;
  executionMode: AdapterExecutionMode;
  supportedAspectRatios: string[];
  maxDurationSeconds: number;
  supportsNegativePrompt: boolean;
  generate(prompt: string, settings: GenerationSettings): Promise<VideoGenerationResult>;
  isAvailable(): boolean;
}

export abstract class BaseAdapter implements IVideoModelAdapter {
  abstract id: string;
  abstract provider: string;
  executionMode: AdapterExecutionMode = 'stub';
  abstract supportedAspectRatios: string[];
  abstract maxDurationSeconds: number;
  abstract supportsNegativePrompt: boolean;

  abstract generate(prompt: string, settings: GenerationSettings): Promise<VideoGenerationResult>;

  isAvailable(): boolean {
    const key = this.getApiKey();
    return !!key && key.length > 0;
  }

  protected getApiKey(): string | undefined {
    return undefined;
  }

  protected async simulateNetworkDelay(ms: number = 2000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
