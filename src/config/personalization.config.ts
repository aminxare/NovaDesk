export interface WallpaperPreset {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'bloom',
    name: 'Windows Bloom',
    url: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'neon-city',
    name: 'Cyber City',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cosmic',
    name: 'Deep Nebula',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'dunes',
    name: 'Desert Dunes',
    url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'misty-forest',
    name: 'Misty Mountains',
    url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1511497584788-87676104235f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'abstract-waves',
    name: 'Fluid Waves',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'aurora',
    name: 'Midnight Aurora',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cyber-highway',
    name: 'Neon Highway',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
];
export interface ColorPreset {
  name: string;
  value: string;
}

export const SOLID_COLOR_PRESETS: ColorPreset[] = [
  { name: 'OLED Black', value: '#09090b' },
  { name: 'Midnight Slate', value: '#0f172a' },
  { name: 'Deep Navy', value: '#0c1a30' },
  { name: 'Forest Emerald', value: '#062c22' },
  { name: 'Velvet Crimson', value: '#2e0c15' },
  { name: 'Cyber Violet', value: '#1e1035' },
  { name: 'Charcoal Slate', value: '#1e2022' },
  { name: 'Steel Gray', value: '#1e293b' },
  { name: 'Royal Indigo', value: '#1e1b4b' },
  { name: 'Dark Espresso', value: '#1c1917' },
  { name: 'Deep Purple', value: '#2e1065' },
  { name: 'Titanium', value: '#334155' },
];

export interface GradientPreset {
  name: string;
  value: string;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    name: 'Cosmic Violet',
    value: 'linear-gradient(135deg, #18052e 0%, #4c1d95 50%, #0f172a 100%)',
  },
  {
    name: 'Aurora Borealis',
    value: 'linear-gradient(135deg, #09203f 0%, #537895 100%)',
  },
  {
    name: 'Sunset Blaze',
    value: 'linear-gradient(135deg, #2c0b0e 0%, #7c2d12 50%, #1e1b4b 100%)',
  },
  {
    name: 'Cyber Emerald',
    value: 'linear-gradient(135deg, #022c22 0%, #065f46 50%, #042f2e 100%)',
  },
  {
    name: 'Midnight Abyss',
    value: 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #0f172a 100%)',
  },
  {
    name: 'Oceanic Deep',
    value: 'linear-gradient(135deg, #030712 0%, #0369a1 50%, #082f49 100%)',
  },
  {
    name: 'Neon Twilight',
    value: 'linear-gradient(135deg, #2e0854 0%, #a21caf 50%, #3b0764 100%)',
  },
  {
    name: 'Dark Metallic',
    value: 'linear-gradient(135deg, #111827 0%, #374151 50%, #111827 100%)',
  },
];

export interface TaskbarPreset {
  name: string;
  value: string;
  description: string;
}

export const TASKBAR_PRESETS: TaskbarPreset[] = [
  { name: 'Default Dark Glass', value: 'rgba(28, 28, 28, 0.9)', description: 'Classic Windows 11 style' },
  { name: 'Deep Midnight', value: 'rgba(15, 23, 42, 0.92)', description: 'Dark slate acrylic' },
  { name: 'Pitch Black', value: 'rgba(5, 5, 5, 0.92)', description: 'Pure stealth glass' },
  { name: 'Cyber Violet', value: 'rgba(49, 16, 75, 0.92)', description: 'Vibrant cyberpunk neon' },
  { name: 'Forest Emerald', value: 'rgba(6, 44, 34, 0.92)', description: 'Deep nature tint' },
  { name: 'Crimson Ruby', value: 'rgba(69, 10, 25, 0.92)', description: 'Rich wine red' },
  { name: 'Sapphire Ocean', value: 'rgba(12, 43, 78, 0.92)', description: 'Deep maritime blue' },
  { name: 'Translucent Glass', value: 'rgba(30, 41, 59, 0.55)', description: 'High transparency blur' },
  { name: 'Frosted Ice', value: 'rgba(255, 255, 255, 0.22)', description: 'Bright frosted acrylic' },
  { name: 'Solid OLED', value: 'rgba(0, 0, 0, 1.0)', description: 'Zero transparency solid' },
];

export function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return hex;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(2))})`;
}

export function parseRgbaOrHex(color: string): { hex: string; alpha: number } {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return {
      hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
      alpha: a,
    };
  }
  if (color.startsWith('#')) {
    return { hex: color, alpha: 1 };
  }
  return { hex: '#1c1c1c', alpha: 0.9 };
}
