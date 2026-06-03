import type { ParticleType, VRAnimation } from './boyfriend';
import type { BoyfriendProfile } from './boyfriend';

export type VRMode = 'idle' | 'talking' | 'touching' | 'photo';

export interface VRScene {
  id: string;
  name: string;
  backgroundType: 'image' | 'gradient' | 'panorama';
  backgroundUrl: string;
  ambientLightColor: string;
  particlesType: ParticleType;
  particleColor: string;
  particleDensity: number;
  bgmUrl: string;
  bgmVolume: number;
  ambientSoundUrl?: string;
}

export interface VRState {
  isActive: boolean;
  currentScene: VRScene | null;
  boyfriend: BoyfriendProfile | null;
  mode: VRMode;
  boyfriendPosition: { x: number; y: number; scale: number };
  bgmPlaying: boolean;
  spatialAudioEnabled: boolean;
  fps: number;
  quality: 'low' | 'medium' | 'high';
}

export interface VRInteraction {
  type: 'tap' | 'swipe' | 'longpress' | 'shake';
  target: 'boyfriend' | 'environment' | 'ui';
  triggerAnimation: VRAnimation;
  triggerReply?: string;
  cooldown: number;
}
