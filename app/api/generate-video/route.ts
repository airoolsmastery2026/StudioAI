
import { NextResponse } from 'next/server';
import { getModelAdapter } from '@/lib/modelMapper';
import { GenerationSettings } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, prompt, model, settings } = body;

    // Validate Input
    if (!jobId || !prompt || !model) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Default Settings if not provided
    const genSettings: GenerationSettings = settings || {
      quality: 'Standard',
      motion: 'Medium',
      priority: 'Quality'
    };

    // 1. Select Adapter
    const adapter = getModelAdapter(model);

    if (!adapter) {
        return NextResponse.json({ error: `Model ${model} is not supported` }, { status: 400 });
    }

    // 2. Check Availability (API Key existence)
    if (!adapter.isAvailable()) {
        console.error(`[API] Model ${model} is configured but missing API Key.`);
        return NextResponse.json({ 
            error: `Model provider ${adapter.provider} is currently unavailable (Missing Credentials).` 
        }, { status: 503 });
    }

    // 3. Orchestrate Generation
    // Note: In a real serverless env with long generation times, we would push to a queue here.
    // For this architecture, we await the "init" or mock simulation.
    
    console.log(`[Orchestration] Starting Job ${jobId} on ${adapter.provider}`);
    const result = await adapter.generate(prompt, genSettings);

    if (!result.success) {
        return NextResponse.json({ 
            error: result.error || "Generation failed at provider level" 
        }, { status: 500 });
    }

    // 4. Return Success
    return NextResponse.json({ 
        success: true, 
        jobId, 
        status: 'queued', // or 'done' depending on adapter behavior
        url: result.url,
        metadata: result.metadata
    });

  } catch (error: any) {
    console.error("Orchestration Critical Failure:", error);
    return NextResponse.json({ error: "Internal Orchestration Error" }, { status: 500 });
  }
}
