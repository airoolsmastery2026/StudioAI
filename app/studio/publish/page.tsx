'use client';

import { useMemo, useState } from 'react';
import { DEFAULT_SOCIAL_TARGETS, type SocialPlatform } from '@/lib/socialPlatforms';

const label: Record<SocialPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  youtube: 'YouTube Shorts',
};

export default function PublishPage() {
  const [sourceJobId, setSourceJobId] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selected, setSelected] = useState<Set<SocialPlatform>>(() => new Set(DEFAULT_SOCIAL_TARGETS.map((item) => item.platform)));
  const [status, setStatus] = useState('Chưa gửi.');
  const [busy, setBusy] = useState(false);

  const targets = useMemo(() => DEFAULT_SOCIAL_TARGETS.map((target) => ({
    ...target,
    enabled: selected.has(target.platform),
  })), [selected]);

  const toggle = (platform: SocialPlatform) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(platform)) next.delete(platform); else next.add(platform);
      return next;
    });
  };

  const submit = async () => {
    setBusy(true);
    setStatus('Đang gửi sang BOT ĐĂNG BÀI…');
    try {
      const response = await fetch('/api/social-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceJobId, content, imageUrl, videoUrl, scheduledTime: scheduledTime || undefined, targets }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
      const created = Array.isArray(body?.data?.created) ? body.data.created : [];
      setStatus(`Đã handoff ${created.length} nền tảng sang persistent worker.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Gửi thất bại.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Social Publish Handoff</h2>
        <p className="text-gray-400">Gửi output StudioAI sang BOT ĐĂNG BÀI để lên lịch và publish qua worker 24/7. Secret chỉ nằm server-side.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-studio-800 border border-studio-700 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-300">Source Job ID</label>
            <input value={sourceJobId} onChange={(event) => setSourceJobId(event.target.value)} className="mt-2 w-full rounded-lg bg-studio-900 border border-studio-700 px-3 py-2 text-white" placeholder="job-123" />
          </div>
          <div>
            <label className="text-sm text-gray-300">Nội dung</label>
            <textarea value={content} onChange={(event) => setContent(event.target.value)} className="mt-2 w-full min-h-40 rounded-lg bg-studio-900 border border-studio-700 px-3 py-2 text-white" placeholder="Caption / post content" />
          </div>
          <div>
            <label className="text-sm text-gray-300">Image URL</label>
            <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} className="mt-2 w-full rounded-lg bg-studio-900 border border-studio-700 px-3 py-2 text-white" placeholder="https://.../image.jpg" />
          </div>
          <div>
            <label className="text-sm text-gray-300">Video URL</label>
            <input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} className="mt-2 w-full rounded-lg bg-studio-900 border border-studio-700 px-3 py-2 text-white" placeholder="https://.../video.mp4" />
          </div>
          <div>
            <label className="text-sm text-gray-300">Lịch đăng</label>
            <input type="datetime-local" value={scheduledTime} onChange={(event) => setScheduledTime(event.target.value)} className="mt-2 w-full rounded-lg bg-studio-900 border border-studio-700 px-3 py-2 text-white" />
          </div>
        </section>

        <section className="bg-studio-800 border border-studio-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Nền tảng</h3>
          <div className="space-y-3">
            {DEFAULT_SOCIAL_TARGETS.map((target) => (
              <button key={target.platform} type="button" onClick={() => toggle(target.platform)} className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${selected.has(target.platform) ? 'border-blue-500 bg-blue-500/10' : 'border-studio-700 bg-studio-900'}`}>
                <div className="flex justify-between gap-4">
                  <span className="text-white font-medium">{label[target.platform]}</span>
                  <span className="text-xs text-gray-400">{target.format}{target.aspectRatio ? ` · ${target.aspectRatio}` : ''}</span>
                </div>
              </button>
            ))}
          </div>
          <button disabled={busy || !sourceJobId.trim() || !content.trim() || selected.size === 0} onClick={submit} className="mt-6 w-full rounded-lg bg-blue-600 disabled:opacity-40 px-4 py-3 font-semibold text-white">
            {busy ? 'Đang gửi…' : 'Gửi BOT ĐĂNG BÀI'}
          </button>
          <p className="mt-4 text-sm text-gray-400">{status}</p>
        </section>
      </div>
    </div>
  );
}
