import { NextRequest, NextResponse } from 'next/server';
import { buildSocialPublishDraft, SOCIAL_PLATFORMS, type SocialPlatform } from '@/lib/socialPlatforms';

const MAX_BODY_BYTES = 64_000;
const BOT_WORKER_URL = (process.env.BOT_DANG_BAI_WORKER_URL || '').replace(/\/$/, '');
const BOT_WORKER_TOKEN = process.env.BOT_DANG_BAI_WORKER_TOKEN || '';

const isHttpUrl = (value?: string) => !value || /^https?:\/\//i.test(value);

export async function POST(request: NextRequest) {
  if (!BOT_WORKER_URL || !BOT_WORKER_TOKEN) {
    return NextResponse.json({ error: 'Social publishing worker chưa được cấu hình server-side.' }, { status: 503 });
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload quá lớn.' }, { status: 413 });
  }

  let input: any;
  try { input = JSON.parse(raw); }
  catch { return NextResponse.json({ error: 'JSON không hợp lệ.' }, { status: 400 }); }

  const draft = buildSocialPublishDraft(input || {});
  if (!draft.sourceJobId || !draft.content) {
    return NextResponse.json({ error: 'Thiếu sourceJobId hoặc nội dung.' }, { status: 400 });
  }
  if (!isHttpUrl(draft.imageUrl) || !isHttpUrl(draft.videoUrl)) {
    return NextResponse.json({ error: 'Media URL phải là HTTP/HTTPS.' }, { status: 400 });
  }

  const supported = new Set<SocialPlatform>(SOCIAL_PLATFORMS);
  const jobs = draft.targets
    .filter((target) => supported.has(target.platform))
    .map((target) => ({
      campaignId: `studioai:${draft.sourceJobId}`,
      content: draft.content,
      platforms: [target.platform],
      scheduledTime: draft.scheduledTime || new Date(Date.now() + 60_000).toISOString(),
      imageUrl: draft.imageUrl || '',
      videoUrl: draft.videoUrl || '',
      targetIds: {},
      metadata: { source: 'studioai', title: draft.title || '', format: target.format },
    }));

  if (!jobs.length) return NextResponse.json({ error: 'Không có nền tảng hợp lệ.' }, { status: 400 });

  const results = [];
  for (const job of jobs) {
    const response = await fetch(`${BOT_WORKER_URL}/v1/jobs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${BOT_WORKER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(job),
      cache: 'no-store',
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok && response.status !== 409) {
      return NextResponse.json({ error: body.error || `Worker HTTP ${response.status}`, partial: results }, { status: 502 });
    }
    results.push({ platform: job.platforms[0], duplicate: response.status === 409, job: body.data || null });
  }

  return NextResponse.json({ data: { sourceJobId: draft.sourceJobId, created: results } });
}
