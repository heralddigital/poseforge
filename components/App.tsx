'use client';
import { useEffect, useState } from 'react';
import { useStore, type Tab } from '@/lib/store';
import { GenerateView } from './GenerateView';
import { HistoryView } from './HistoryView';
import { LibraryView } from './LibraryView';
import { SettingsView } from './SettingsView';
import { Toasts } from './ui';

const TABS: { key: Tab; label: string }[] = [
  { key: 'generate', label: 'Generate' },
  { key: 'history', label: 'History' },
  { key: 'library', label: 'Library' },
  { key: 'settings', label: 'Settings' }
];

export function App() {
  const ready = useStore((s) => s.ready);
  const tab = useStore((s) => s.tab);
  const setTab = useStore((s) => s.setTab);
  const error = useStore((s) => s.error);
  const unused = useStore((s) => s.prompts.filter((p) => p.status === 'unused').length);

  const [light, setLight] = useState(false);
  useEffect(() => { void useStore.getState().init(); }, []);
  useEffect(() => { setLight(document.documentElement.dataset.theme === 'light'); }, []);
  const toggleTheme = () => {
    const next = !light;
    setLight(next);
    if (next) document.documentElement.dataset.theme = 'light'; else delete document.documentElement.dataset.theme;
    try { localStorage.setItem('poseforge:theme', next ? 'light' : 'dark'); } catch { /* ignore */ }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const s = useStore.getState();
      if (e.key === 'r' || e.key === 'R') { s.setTab('generate'); s.generate(1); }
      else if (e.key === '/') { e.preventDefault(); s.setTab('history'); setTimeout(() => document.getElementById('history-search')?.focus(), 50); }
      else if (e.key === 'c' || e.key === 'C') {
        const p = s.session[0];
        if (p) void navigator.clipboard.writeText(p.promptText).then(() => { s.toast('Latest prompt copied'); s.markCopied(p.id); });
      } else if (e.key === 'u' || e.key === 'U') {
        const p = s.session[0];
        if (p && s.prompts.some((x) => x.id === p.id)) s.setStatus([p.id], 'generated');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="shell">
      <div className="panel pt-10 sm:pt-12">
        <div className="eyebrow">
          <span>PoseForge - prompt studio</span>
          <button className="mono ml-auto text-[10px] hover:underline" onClick={toggleTheme} aria-label="Toggle light or dark theme">{light ? 'Night' : 'Cream'} theme</button>
        </div>
        <header className="mb-6 mt-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 sm:mt-12">
          <h1 className="max-w-[14em] text-[40px] leading-[1.08] tracking-[-0.02em] sm:text-[56px] sm:leading-[61px]">
            Prompts that read like photographs.
          </h1>
          <nav className="flex w-full flex-wrap gap-x-6 gap-y-1 sm:w-auto" aria-label="Sections">
            {TABS.map((t, i) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                aria-current={tab === t.key ? 'page' : undefined}
                className={`mono border-b py-2 text-[11px] ${tab === t.key ? 'border-ink text-ink' : 'border-line text-mute hover:text-ink'}`}
              >
                {String(i + 1).padStart(2, '0')}&nbsp;&nbsp;{t.label}
                {t.key === 'history' && unused > 0 ? <span className="ml-1.5 bg-signal px-1 text-on-signal">{unused}</span> : null}
              </button>
            ))}
          </nav>
        </header>
        {error && <p className="mb-4 border border-line bg-panel2 p-3 text-sm">{error}</p>}
        {!ready ? <p className="mono text-[11px] text-mute">Loading…</p> : tab === 'generate' ? <GenerateView /> : tab === 'history' ? <HistoryView /> : tab === 'library' ? <LibraryView /> : <SettingsView />}
      </div>
      <Toasts />
    </div>
  );
}
