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
    url: 'https://duckduckgo.com',
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
    url: 'https://duckduckgo.com',
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
