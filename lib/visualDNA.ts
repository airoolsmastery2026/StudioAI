import { VisualDNA } from '@/types';

export const DEFAULT_DNA: VisualDNA = {
  duration: 'Medium (5-10s)',
  aspectRatio: '16:9',
  cameraType: 'Static Tripod',
  lightingFlow: 'Natural Day',
  motionStyle: 'Subtle',
  pacing: 'Slow',
  colorGrade: 'Neutral'
};

export const DNA_OPTIONS = {
  aspectRatio: ['16:9', '9:16', '1:1', '2.35:1'],
  cameraType: ['Static Tripod', 'Slow Pan', 'Dolly In', 'Handheld', 'Drone Hover'],
  lightingFlow: ['Natural Day', 'Golden Hour', 'Cinematic Night', 'Studio High-Key'],
  motionStyle: ['Subtle', 'Dynamic', 'Fast-Paced', 'Slow Motion'],
  pacing: ['Slow', 'Medium', 'Fast'],
  colorGrade: ['Neutral', 'Warm', 'Cool', 'Vintage', 'Cyberpunk']
};
