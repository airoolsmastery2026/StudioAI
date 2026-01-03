
import { BaseAdapter, VideoGenerationResult } from './BaseModelAdapter';
import { GenerationSettings } from '@/types';

export class RunwayAdapter extends BaseAdapter {
  id = 'runway';
  provider = 'RunwayML';
  supportedAspectRatios = ['16:9', '9:16', '21:9'];
  maxDurationSeconds = 16;
  supportsNegativePrompt = false;

  protected getApiKey(): string | undefined {
    return process.env.RUNWAY_API_KEY;
  }

  async generate(prompt: string, settings: GenerationSettings): Promise<VideoGenerationResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Runway API Key missing' };
    }

    try {
      console.log(`[Runway] Generating intent: ${prompt.substring(0, 20)}...`);
      await this.simulateNetworkDelay(2500);

      return {
        success: true,
        url: `https://picsum.photos/seed/runway-${Date.now()}/1920/1080`,
        metadata: { model: 'gen-3-alpha', priority: settings.priority }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
