import { DimensionPreset } from '../types';

export const DIMENSION_PRESETS: DimensionPreset[] = [
  // Social
  {
    id: 'ig-square',
    category: 'social',
    name: 'Instagram Square',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'Standard grid post feed format',
  },
  {
    id: 'ig-portrait',
    category: 'social',
    name: 'Instagram Portrait',
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    description: 'Max vertical feed space',
  },
  {
    id: 'ig-story',
    category: 'social',
    name: 'Story / Reel / Shorts',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Full screen vertical mobile',
  },
  {
    id: 'og-share',
    category: 'social',
    name: 'Social Share / OpenGraph',
    width: 1200,
    height: 630,
    aspectRatio: '1.91:1',
    description: 'Twitter / Facebook / Slack link preview card',
  },
  {
    id: 'yt-thumb',
    category: 'social',
    name: 'YouTube Thumbnail',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    description: 'Standard 720p 16:9 video thumbnail',
  },
  {
    id: 'x-banner',
    category: 'social',
    name: 'X / Twitter Header',
    width: 1500,
    height: 500,
    aspectRatio: '3:1',
    description: 'Profile background banner',
  },

  // Web
  {
    id: 'web-fhd',
    category: 'web',
    name: 'Full HD Web Hero',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    description: 'Desktop standard 1080p hero',
  },
  {
    id: 'web-standard',
    category: 'web',
    name: 'Web Content Width',
    width: 1200,
    height: 800,
    aspectRatio: '3:2',
    description: 'Standard article or blog visual',
  },
  {
    id: 'web-mobile-hero',
    category: 'web',
    name: 'Mobile Web Banner',
    width: 750,
    height: 1000,
    aspectRatio: '3:4',
    description: 'Optimized portrait layout for mobile screens',
  },
  {
    id: 'thumb-avatar',
    category: 'web',
    name: 'Avatar / Icon',
    width: 256,
    height: 256,
    aspectRatio: '1:1',
    description: 'High-density user avatar or app icon',
  },
];

export const FORMAT_DETAILS: Record<string, { label: string; ext: string; mime: string; desc: string }> = {
  'image/webp': {
    label: 'WebP',
    ext: 'webp',
    mime: 'image/webp',
    desc: 'Google modern web format with superior 30-50% smaller sizes',
  },
  'image/jpeg': {
    label: 'JPEG',
    ext: 'jpg',
    mime: 'image/jpeg',
    desc: 'Universal compatibility across all devices, best for photographs',
  },
  'image/png': {
    label: 'PNG',
    ext: 'png',
    mime: 'image/png',
    desc: 'Lossless quality, ideal for sharp graphics, text, and transparency',
  },
  'image/avif': {
    label: 'AVIF',
    ext: 'avif',
    mime: 'image/avif',
    desc: 'Next-gen AV1 compression for ultra-lightweight web delivery',
  },
};
