
import { GenerationSettings } from '@/types';

export interface VideoGenerationResult {
  success: boolean;
  url?: string;
  jobId?: string;
  error?: string;
  metadata?: any;
}

export interface IVideoModelAdapter {
  id: string;
  provider: string;
  
  // Capabilities
  supportedAspectRatios: string[];
  maxDurationSeconds: number;
  supportsNegativePrompt: boolean;
  
  // Execution
  generate(prompt: string, settings: GenerationSettings): Promise<VideoGenerationResult>;
  
  // Health Check
  isAvailable(): boolean;
}

export abstract class BaseAdapter implements IVideoModelAdapter {
  abstract id: string;
  abstract provider: string;
  abstract supportedAspectRatios: string[];
  abstract maxDurationSeconds: number;
  abstract supportsNegativePrompt: boolean;

  abstract generate(prompt: string, settings: GenerationSettings): Promise<VideoGenerationResult>;

  isAvailable(): boolean {
    // Default check: simple API key existence
    const key = this.getApiKey();
    return !!key && key.length > 0;
  }

  protected getApiKey(): string | undefined {
    // This should be overridden by specific adapters to check their specific env var
    return undefined;
  }

  protected async simulateNetworkDelay(ms: number = 2000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
