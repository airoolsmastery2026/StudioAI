export const SOCIAL_PLATFORMS = ['facebook', 'instagram', 'tiktok', 'linkedin', 'pinterest', 'youtube'] as const;

export type SocialPlatform = typeof SOCIAL_PLATFORMS[number];

export interface SocialPublishTarget {
  platform: SocialPlatform;
  enabled: boolean;
  format: 'text' | 'image' | 'video';
  aspectRatio?: string;
  notes?: string;
}

export interface SocialPublishDraft {
  sourceJobId: string;
  title?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  scheduledTime?: string;
  targets: SocialPublishTarget[];
}

export const DEFAULT_SOCIAL_TARGETS: SocialPublishTarget[] = [
  { platform: 'facebook', enabled: true, format: 'image', aspectRatio: '1:1' },
  { platform: 'instagram', enabled: true, format: 'image', aspectRatio: '4:5' },
  { platform: 'tiktok', enabled: true, format: 'video', aspectRatio: '9:16' },
  { platform: 'linkedin', enabled: true, format: 'text' },
  { platform: 'pinterest', enabled: true, format: 'image', aspectRatio: '2:3' },
  { platform: 'youtube', enabled: true, format: 'video', aspectRatio: '9:16', notes: 'YouTube Shorts handoff target' },
];

export const buildSocialPublishDraft = (input: {
  sourceJobId: string;
  content: string;
  title?: string;
  imageUrl?: string;
  videoUrl?: string;
  scheduledTime?: string;
  targets?: SocialPublishTarget[];
}): SocialPublishDraft => ({
  sourceJobId: input.sourceJobId,
  title: input.title?.trim() || undefined,
  content: input.content.trim(),
  imageUrl: input.imageUrl?.trim() || undefined,
  videoUrl: input.videoUrl?.trim() || undefined,
  scheduledTime: input.scheduledTime,
  targets: (input.targets || DEFAULT_SOCIAL_TARGETS).filter((target) => target.enabled),
});
