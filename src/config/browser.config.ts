import { BookmarkItem, SearchEngine, SearchEngineId } from '../types/browser';

export const SEARCH_ENGINES: Record<SearchEngineId, SearchEngine> = {
  google: {
    id: 'google',
    name: 'Google',
    searchUrl: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    // DuckDuckGo HTML is 100% embeddable in iframes without X-Frame-Options blocking
    iframeUrl: (q: string) => `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`,
    icon: 'https://www.google.com/s2/favicons?domain=google.com&sz=32',
  },
  duckduckgo: {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    searchUrl: (q: string) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
    iframeUrl: (q: string) => `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`,
    icon: 'https://www.google.com/s2/favicons?domain=duckduckgo.com&sz=32',
  },
  bing: {
    id: 'bing',
    name: 'Bing',
    searchUrl: (q: string) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    iframeUrl: (q: string) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    icon: 'https://www.google.com/s2/favicons?domain=bing.com&sz=32',
  },
  wikipedia: {
    id: 'wikipedia',
    name: 'Wikipedia',
    searchUrl: (q: string) => `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`,
    iframeUrl: (q: string) => `https://en.m.wikipedia.org/w/index.php?search=${encodeURIComponent(q)}`,
    icon: 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=32',
  },
};

export const DEFAULT_BOOKMARKS: BookmarkItem[] = [
  {
    id: 'google',
    title: 'Google',
    url: 'https://www.google.com',
    category: 'search',
  },
  {
    id: 'duckduckgo',
    title: 'DuckDuckGo',
    url: 'https://html.duckduckgo.com/html/',
    category: 'search',
  },
  {
    id: 'wikipedia',
    title: 'Wikipedia',
    url: 'https://en.wikipedia.org',
    category: 'reference',
  },
  {
    id: 'youtube',
    title: 'YouTube',
    url: 'https://www.youtube.com',
    category: 'social',
  },
  {
    id: 'github',
    title: 'GitHub',
    url: 'https://github.com',
    category: 'developer',
  },
  {
    id: 'reddit',
    title: 'Reddit',
    url: 'https://www.reddit.com',
    category: 'social',
  },
  {
    id: 'chatgpt',
    title: 'ChatGPT',
    url: 'https://chatgpt.com',
    category: 'tools',
  },
  {
    id: 'stackoverflow',
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    category: 'developer',
  },
  {
    id: 'novadesk-docs',
    title: 'NovaDesk Docs',
    url: 'novadesk://docs',
    category: 'tools',
  },
];

export const POPULAR_SHORTCUTS = [
  {
    id: 'google',
    title: 'Google Search',
    description: 'World\'s most popular web search engine',
    url: 'https://www.google.com',
    domain: 'google.com',
    bgColor: 'from-blue-600/20 to-red-600/20',
  },
  {
    id: 'duckduckgo',
    title: 'DuckDuckGo',
    description: 'Privacy-focused search engine with embeddable results',
    url: 'https://html.duckduckgo.com/html/',
    domain: 'duckduckgo.com',
    bgColor: 'from-orange-500/20 to-amber-600/20',
  },
  {
    id: 'wikipedia',
    title: 'Wikipedia',
    description: 'The free knowledge encyclopedia',
    url: 'https://en.wikipedia.org',
    domain: 'wikipedia.org',
    bgColor: 'from-slate-500/20 to-slate-700/20',
  },
  {
    id: 'github',
    title: 'GitHub',
    description: 'Code repository hosting and open source development',
    url: 'https://github.com',
    domain: 'github.com',
    bgColor: 'from-purple-600/20 to-slate-800/20',
  },
  {
    id: 'youtube',
    title: 'YouTube',
    description: 'Online video platform and streaming hub',
    url: 'https://www.youtube.com',
    domain: 'youtube.com',
    bgColor: 'from-red-600/20 to-rose-700/20',
  },
  {
    id: 'reddit',
    title: 'Reddit',
    description: 'The front page of the internet communities',
    url: 'https://www.reddit.com',
    domain: 'reddit.com',
    bgColor: 'from-orange-600/20 to-red-600/20',
  },
  {
    id: 'chatgpt',
    title: 'ChatGPT',
    description: 'AI assistant and generative conversation model',
    url: 'https://chatgpt.com',
    domain: 'chatgpt.com',
    bgColor: 'from-emerald-600/20 to-teal-700/20',
  },
  {
    id: 'novadesk-docs',
    title: 'NovaDesk Help & Docs',
    description: 'Learn about the NovaDesk web OS simulator',
    url: 'novadesk://docs',
    domain: 'novadesk.local',
    bgColor: 'from-cyan-600/20 to-blue-700/20',
  },
];

export function isUrl(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('novadesk://')) {
    return true;
  }
  // Check domain patterns like example.com, sub.example.co.uk, localhost:3000
  const domainPattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?::\d+)?(?:\/.*)?$/;
  const localhostPattern = /^localhost(?::\d+)?(?:\/.*)?$/;
  return domainPattern.test(trimmed) || localhostPattern.test(trimmed);
}

export function formatUrl(input: string, engine: SearchEngine): string {
  const trimmed = input.trim();
  if (!trimmed) return 'novadesk://newtab';

  if (trimmed.startsWith('novadesk://')) {
    return trimmed;
  }

  if (isUrl(trimmed)) {
    if (!trimmed.match(/^https?:\/\//i)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  // Otherwise, treat as search query
  return engine.searchUrl(trimmed);
}

export interface EmbeddableUrl {
  url: string;
  provider: 'youtube' | 'vimeo';
}

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
]);

const VIMEO_HOSTS = new Set(['vimeo.com']);

const FRAME_BLOCKED_HOSTS = new Set([
  'google.com',
  'bing.com',
  'duckduckgo.com',
  'youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'github.com',
  'gist.github.com',
  'reddit.com',
  'old.reddit.com',
  'chatgpt.com',
  'stackoverflow.com',
  'x.com',
  'twitter.com',
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'amazon.com',
  'netflix.com',
  'notion.so',
  'figma.com',
  'medium.com',
  'twitch.tv',
]);

function normalizeHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, '');
}

function parseTimeToSeconds(value: string | null): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);

  const match = trimmed.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!match || (!match[1] && !match[2] && !match[3])) return null;

  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

function getYouTubeVideoId(url: URL): string | null {
  const host = normalizeHost(url.hostname);
  if (host === 'youtu.be') {
    return url.pathname.split('/').filter(Boolean)[0] ?? null;
  }

  const segments = url.pathname.split('/').filter(Boolean);
  if (segments[0] === 'watch') return url.searchParams.get('v');
  if (segments[0] === 'v') return segments[1] ?? null;
  if (segments[0] === 'shorts' || segments[0] === 'live' || segments[0] === 'embed') {
    if (segments[0] === 'embed' && segments[1] === 'videoseries') return null;
    return segments[1] ?? null;
  }
  return null;
}

function getYouTubePlaylistId(url: URL): string | null {
  const segments = url.pathname.split('/').filter(Boolean);
  if (segments[0] === 'playlist') return url.searchParams.get('list');
  if (segments[0] === 'embed' && segments[1] === 'videoseries') return url.searchParams.get('list');
  return null;
}

function buildYouTubeVideoEmbed(id: string, start: number | null, list: string | null): EmbeddableUrl {
  const params = new URLSearchParams();
  if (start && start > 0) params.set('start', String(start));
  if (list) params.set('list', list);
  const query = params.toString();

  return {
    provider: 'youtube',
    url: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}${query ? `?${query}` : ''}`,
  };
}

function buildYouTubePlaylistEmbed(list: string, start: number | null): EmbeddableUrl {
  const params = new URLSearchParams({ list });
  if (start && start > 0) params.set('start', String(start));

  return {
    provider: 'youtube',
    url: `https://www.youtube-nocookie.com/embed/videoseries?${params.toString()}`,
  };
}

/**
 * Returns an embeddable player URL for services that publish one.
 *
 * This does not bypass X-Frame-Options. Sites like YouTube only permit their
 * dedicated player pages to be framed, so watch/short/live URLs must be
 * rewritten before they reach the iframe.
 */
export function getEmbeddableUrl(input: string): EmbeddableUrl | null {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    try {
      url = new URL(`https://${input}`);
    } catch {
      return null;
    }
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const host = normalizeHost(url.hostname);
  const start = parseTimeToSeconds(url.searchParams.get('start') ?? url.searchParams.get('t'));

  if (host === 'youtu.be' || YOUTUBE_HOSTS.has(host)) {
    const playlistId = getYouTubePlaylistId(url);
    if (playlistId) return buildYouTubePlaylistEmbed(playlistId, start);

    const videoId = getYouTubeVideoId(url);
    if (videoId) return buildYouTubeVideoEmbed(videoId, start, url.searchParams.get('list'));

    // A watch URL can carry only a playlist id.
    const list = url.searchParams.get('list');
    if (list) return buildYouTubePlaylistEmbed(list, start);

    return null;
  }

  if (VIMEO_HOSTS.has(host)) {
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.some((segment) => segment === 'album' || segment === 'showcase')) return null;

    const id = [...segments].reverse().find((segment) => /^\d+$/.test(segment));
    if (!id) return null;

    const hash = url.searchParams.get('h');
    return {
      provider: 'vimeo',
      url: `https://player.vimeo.com/video/${id}${hash ? `?h=${encodeURIComponent(hash)}` : ''}`,
    };
  }

  if (host === 'player.vimeo.com') {
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments[0] !== 'video' || !segments[1]) return null;
    return { provider: 'vimeo', url: url.toString() };
  }

  return null;
}

/**
 * Known hosts that send X-Frame-Options or CSP frame-ancestors headers. These
 * can never be framed by a client-side app; the viewer shows a fallback instead
 * of a blank iframe. The list is intentionally conservative and the fallback
 * still offers a "try loading anyway" escape hatch.
 */
export function isKnownFrameBlocked(input: string): boolean {
  try {
    const url = new URL(input);
    return FRAME_BLOCKED_HOSTS.has(normalizeHost(url.hostname));
  } catch {
    return false;
  }
}


export function extractDomain(url: string): string {
  if (url.startsWith('novadesk://')) {
    return 'NovaDesk OS';
  }
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function getFaviconUrl(url: string): string {
  if (url.startsWith('novadesk://')) {
    return '';
  }
  const domain = extractDomain(url);
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
}
