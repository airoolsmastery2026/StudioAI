import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { buildSocialPublishDraft, SOCIAL_PLATFORMS, type SocialPlatform } from '@/lib/socialPlatforms';

const MAX_BODY_BYTES = 64_000;
const BOT_WORKER_URL = (process.env.BOT_DANG_BAI_WORKER_URL || '').replace(/\/$/, '');
const BOT_WORKER_TOKEN = process.env.BOT_DANG_BAI_WORKER_TOKEN || '';

const isHttpUrl = (value?: string) => !value || /^https?:\/\//i.test(value);
const requiresImage = (platform: SocialPlatform) => platform === 'instagram' || platform === 'pinterest';
const requiresVideo = (platform: SocialPlatform) => platform === 'tiktok' || platform === 'youtube';
const validScheduledTime = (value?: string) => !value || Number.isFinite(new Date(value).getTime());
const idempotencyKey = (job: Record<string, unknown>) => crypto.createHash('sha256').update(JSON.stringify(job)).digest('hex');

export async function POST(request: NextRequest) {
  if (!BOT_WORKER_URL || !BOT_WORKER_TOKEN) {
    return NextResponse.json({ error: 'Social publishing worker chưa được cấu hình server-side.' }, { status: 503 });
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload quá lớn.' }, { status: 413 });
  }

  let input: unknown;
  try { input = JSON.parse(raw); }
  catch { return NextResponse.json({ error: 'JSON không hợp lệ.' }, { status: 400 }); }
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return NextResponse.json({ error: 'Payload không hợp lệ.' }, { status: 400 });
  }

  const draft = buildSocialPublishDraft(input as Parameters<typeof buildSocialPublishDraft>[0]);
  if (!draft.sourceJobId || !draft.content) {
    return NextResponse.json({ error: 'Thiếu sourceJobId hoặc nội dung.' }, { status: 400 });
  }
  if (!validScheduledTime(draft.scheduledTime)) {
    return NextResponse.json({ error: 'Lịch đăng không hợp lệ.' }, { status: 400 });
  }
  if (!isHttpUrl(draft.imageUrl) || !isHttpUrl(draft.videoUrl)) {
    return NextResponse.json({ error: 'Media URL phải là HTTP/HTTPS.' }, { status: 400 });
  }

  const supported = new Set<SocialPlatform>(SOCIAL_PLATFORMS);
  const targets = draft.targets.filter((target) => supported.has(target.platform));
  const mediaErrors = targets.flatMap((target) => {
    if (requiresImage(target.platform) && !draft.imageUrl) return [`${target.platform}: cần image URL.`];
    if (requiresVideo(target.platform) && !draft.videoUrl) return [`${target.platform}: cần video URL.`];
    return [];
  });
  if (mediaErrors.length) {
    return NextResponse.json({ error: mediaErrors.join(' ') }, { status: 400 });
  }
  if (!targets.length) return NextResponse.json({ error: 'Không có nền tảng hợp lệ.' }, { status: 400 });

  let workerHealth: any;
  try {
    const response = await fetch(`${BOT_WORKER_URL}/health`, { cache: 'no-store' });
    workerHealth = await response.json().catch(() => ({}));
    if (!response.ok || workerHealth?.status !== 'ok') {
      return NextResponse.json({ error: 'Publishing worker chưa sẵn sàng.' }, { status: 503 });
    }
  } catch {
    return NextResponse.json({ error: 'Không thể kết nối publishing worker.' }, { status: 503 });
  }

  const accounts = Array.isArray(workerHealth?.accounts) ? workerHealth.accounts : [];
  const accountErrors = targets.flatMap((target) => {
    const account = accounts.find((item: any) => item?.platform === target.platform);
    if (!account) return [`${target.platform}: chưa cấu hình tài khoản.`];
    if (account.ready !== true) {
      const reason = account.verificationStatus || account.verificationErrorCode || 'not_ready';
      return [`${target.platform}: tài khoản chưa sẵn sàng (${reason}).`];
    }
    return [];
  });
  if (accountErrors.length) {
    return NextResponse.json({ error: accountErrors.join(' '), errorCode: 'ACCOUNT_PREFLIGHT_FAILED' }, { status: 409 });
  }

  const scheduledTime = draft.scheduledTime ? new Date(draft.scheduledTime).toISOString() : new Date(Date.now() + 60_000).toISOString();
  const jobs = targets.map((target) => ({
    campaignId: `studioai:${draft.sourceJobId}`,
    title: draft.title || draft.content.slice(0, 100),
    content: draft.content,
    platforms: [target.platform],
    scheduledTime,
    imageUrl: draft.imageUrl || '',
    videoUrl: draft.videoUrl || '',
    privacyStatus: target.platform === 'youtube' ? 'private' : undefined,
    targetIds: {},
  }));

  const results = [];
  for (const job of jobs) {
    const key = idempotencyKey(job);
    const response = await fetch(`${BOT_WORKER_URL}/v1/jobs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${BOT_WORKER_TOKEN}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify({ ...job, idempotencyKey: key }),
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
