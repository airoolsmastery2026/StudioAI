import { NextResponse } from 'next/server';
import { getModelAdapter } from '@/lib/modelMapper';
import { GenerationSettings } from '@/types';

const DEFAULT_SETTINGS: GenerationSettings = {
  quality: 'Standard',
  motion: 'Medium',
  priority: 'Quality',
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const jobId = String(body.jobId || '').trim();
    const prompt = String(body.prompt || '').trim();
    const model = String(body.model || '').trim();
    const settings = body.settings as GenerationSettings | undefined;

    if (!jobId || !prompt || !model) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adapter = getModelAdapter(model);
    if (!adapter) {
      return NextResponse.json({ error: `Model ${model} is not supported` }, { status: 400 });
    }

    if (adapter.executionMode !== 'live') {
      return NextResponse.json({
        error: `Model provider ${adapter.provider} is not enabled for LIVE generation. Stub/mock adapters are blocked in production paths.`,
        errorCode: 'PROVIDER_NOT_LIVE',
      }, { status: 503 });
    }

    if (!adapter.isAvailable()) {
      return NextResponse.json({
        error: `Model provider ${adapter.provider} is currently unavailable (Missing Credentials).`,
        errorCode: 'PROVIDER_CREDENTIALS_MISSING',
      }, { status: 503 });
    }

    const result = await adapter.generate(prompt, settings || DEFAULT_SETTINGS);
    if (!result.success) {
      return NextResponse.json({
        error: result.error || 'Generation failed at provider level',
        errorCode: 'PROVIDER_GENERATION_FAILED',
      }, { status: 502 });
    }

    if (!result.url && !result.jobId) {
      return NextResponse.json({
        error: 'Provider returned success without a durable job ID or media URL.',
        errorCode: 'PROVIDER_RESPONSE_INVALID',
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      jobId,
      status: result.url ? 'done' : 'processing',
      url: result.url || null,
      providerJobId: result.jobId || null,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('Orchestration Critical Failure:', error);
    return NextResponse.json({ error: 'Internal Orchestration Error' }, { status: 500 });
  }
}
