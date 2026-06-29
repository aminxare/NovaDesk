'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Search20Regular } from '@fluentui/react-icons';

interface SiteData {
  id: string;
  title: string;
  url: string;
  description: string;
  summary: string;
  sections: Array<{ heading: string; text: string }>;
}

const siteCatalog: SiteData[] = [
  {
    id: 'novadesk-home',
    title: 'NovaDesk Home',
    url: 'https://novadesk.local',
    description: 'Your virtual desktop simulator hub with apps, browser, and terminal.',
    summary: 'NovaDesk is a modern desktop simulation built with React and Tailwind CSS.',
    sections: [
      { heading: 'Overview', text: 'Explore apps, open windows, and use the built-in browser and terminal.' },
      { heading: 'Design', text: 'A polished desktop experience with draggable windows and modern UI chrome.' }
    ]
  },
  {
    id: 'novadesk-docs',
    title: 'NovaDesk Docs',
    url: 'https://novadesk.local/docs',
    description: 'Read the quick start guide, app instructions, and keyboard shortcuts.',
    summary: 'Learn how to use NovaDesk, open apps, and customize the desktop experience.',
    sections: [
      { heading: 'Getting started', text: 'Open the Start menu, launch apps, and move windows around.' },
      { heading: 'Terminal', text: 'Use the zsh-inspired terminal to run commands and explore simulated shell output.' }
    ]
  },
  {
    id: 'novadesk-community',
    title: 'NovaDesk Community',
    url: 'https://novadesk.local/community',
    description: 'Connect with other NovaDesk users and share ideas for new desktop apps.',
    summary: 'Join the community, browse updates, and discover new feature ideas.',
    sections: [
      { heading: 'Forums', text: 'Discuss feature requests, share themes, and collaborate on app ideas.' },
      { heading: 'Updates', text: 'See what is coming next for the desktop simulator.' }
    ]
  },
  {
    id: 'novadesk-support',
    title: 'NovaDesk Support',
    url: 'https://novadesk.local/support',
    description: 'Find troubleshooting tips and answers to common simulator questions.',
    summary: 'Support resources for using the desktop shell, apps, and browser features.',
    sections: [
      { heading: 'Help', text: 'Get tips on opening apps, using the terminal, and customizing the desktop.' },
      { heading: 'Report a bug', text: 'Submit issues or request enhancements to the NovaDesk shell.' }
    ]
  },
  {
    id: 'google-search',
    title: 'Google',
    url: 'https://www.google.com',
    description: 'Search the web with Google inside NovaDesk.',
    summary: 'Use Google search in the browser to find pages and sites on the simulator.',
    sections: [
      { heading: 'Search tips', text: 'Enter any query or website name to find matching pages.' }
    ]
  },
  {
    id: 'wikipedia-home',
    title: 'Wikipedia',
    url: 'https://www.wikipedia.org',
    description: 'The free encyclopedia for general knowledge.',
    summary: 'Search the encyclopedia for information and open articles in NovaDesk.',
    sections: [
      { heading: 'Explore topics', text: 'Type a topic name such as history, coding, or science to search Wikipedia.' }
    ]
  }
];

export const BrowserApp = () => {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'home' | 'search' | 'site'>('home');
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSite = useMemo(
    () => siteCatalog.find((site) => site.id === activeSiteId) ?? null,
    [activeSiteId]
  );

  const normalizedSearch = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

  const searchResults = useMemo(() => {
    if (!normalizedSearch) return siteCatalog;
    return siteCatalog.filter((site) => {
      return (
        site.title.toLowerCase().includes(normalizedSearch) ||
        site.description.toLowerCase().includes(normalizedSearch) ||
        site.url.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [normalizedSearch]);

  const goHome = () => {
    setView('home');
    setActiveSiteId(null);
    setSearchTerm('');
    setQuery('');
  };

  const openSite = (siteId: string) => {
    setActiveSiteId(siteId);
    setView('site');
    const site = siteCatalog.find((item) => item.id === siteId);
    setQuery(site?.url ?? '');
    setSearchTerm(site?.title ?? '');
  };

  const normalizeUrl = (text: string) => {
    let url = text.trim();
    if (!url.match(/^https?:\/\//i)) {
      if (url.match(/^[\w-]+\.[a-z]{2,}(\/.*)?$/i)) {
        url = `https://${url}`;
      }
    }
    return url.toLowerCase();
  };

  const findDomainSite = (term: string) => {
    const normalized = term.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');
    return siteCatalog.find((site) => {
      const siteHost = site.url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');
      return siteHost === normalized || site.title.toLowerCase().includes(normalized) || site.description.toLowerCase().includes(normalized);
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      goHome();
      return;
    }

    const normalizedQuery = trimmed.toLowerCase();
    const normalizedUrl = normalizeUrl(trimmed);

    const directSite = siteCatalog.find(
      (site) => site.url.toLowerCase() === normalizedUrl || site.url.toLowerCase().includes(normalizedQuery)
    );

    if (directSite) {
      openSite(directSite.id);
      return;
    }

    const domainSite = findDomainSite(trimmed);
    if (domainSite) {
      openSite(domainSite.id);
      return;
    }

    const keywordSite = siteCatalog.find(
      (site) =>
        site.title.toLowerCase().includes(normalizedQuery) ||
        site.description.toLowerCase().includes(normalizedQuery) ||
        site.url.toLowerCase().includes(normalizedQuery)
    );

    if (keywordSite) {
      openSite(keywordSite.id);
      return;
    }

    setSearchTerm(trimmed);
    setView('search');
  };

  const renderHome = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[#0f172a]/90 p-6">
        <div className="text-sm uppercase tracking-[0.24em] text-slate-400 mb-3">NovaDesk Browser</div>
        <div className="text-3xl font-semibold text-white">Search the web or open a site directly.</div>
        <div className="mt-3 text-slate-300 max-w-2xl">Type a query or paste a known NovaDesk URL to browse sample content and results.</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {siteCatalog.map((site) => (
          <button
            key={site.id}
            onClick={() => openSite(site.id)}
            className="group rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-cyan-400/30 hover:bg-cyan-500/10"
          >
            <div className="text-sm uppercase tracking-[0.24em] text-cyan-300 mb-2">{site.title}</div>
            <div className="text-base text-slate-100">{site.description}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-5">
      <div className="text-sm text-slate-400">About {searchResults.length} results</div>
      <div className="space-y-4">
        {searchResults.length > 0 ? (
          searchResults.map((site) => (
            <button
              key={site.id}
              onClick={() => openSite(site.id)}
              className="w-full text-left rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-400/30 hover:bg-white/10"
            >
              <div className="text-sm text-cyan-300">{site.url}</div>
              <div className="mt-2 text-lg font-semibold text-white">{site.title}</div>
              <div className="mt-1 text-sm text-slate-300">{site.description}</div>
            </button>
          ))
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300">
            No results found for <span className="text-white">{searchTerm}</span>. Try another query.
          </div>
        )}
      </div>
    </div>
  );

  const renderSite = () => {
    if (!activeSite) return renderHome();

    return (
      <div className="space-y-5">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-cyan-300">{activeSite.url}</div>
          <div className="mt-2 text-2xl font-semibold text-white">{activeSite.title}</div>
          <div className="mt-3 text-slate-300">{activeSite.summary}</div>
        </div>
        <div className="grid gap-4">
          {activeSite.sections.map((section) => (
            <div key={section.heading} className="rounded-3xl border border-white/10 bg-[#0f172a]/90 p-5">
              <div className="text-lg font-semibold text-white">{section.heading}</div>
              <div className="mt-2 text-slate-300">{section.text}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#07101d] text-slate-100">
      <div className="border-b border-white/10 bg-[#0c1728]/95 px-5 py-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.26em] text-slate-500">
          <span>NovaDesk Browser</span>
          <span className="text-slate-600">•</span>
          <span>Search</span>
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-[#0f172a]/90 px-4 py-3 shadow-sm shadow-black/20">
          <Search20Regular className="text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Google or type a URL"
            className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Search
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-auto px-5 py-5">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={goHome}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 hover:bg-white/10 transition"
          >
            Home
          </button>
          {(view === 'search' || view === 'site') && (
            <button
              onClick={() => {
                setView('search');
                setActiveSiteId(null);
              }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 hover:bg-white/10 transition"
            >
              Search results
            </button>
          )}
        </div>

        {view === 'home' && renderHome()}
        {view === 'search' && renderSearch()}
        {view === 'site' && renderSite()}
      </div>
    </div>
  );
};
