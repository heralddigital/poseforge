'use client';
import { useEffect } from 'react';
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

  useEffect(() => { void useStore.getState().init(); }, []);

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
    <div className="mx-auto min-h-screen max-w-4xl px-4 pb-24">
      <header className="sticky top-0 z-20 -mx-4 mb-4 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight"><span className="text-accent">Pose</span>Forge</h1>
          <nav className="ml-auto flex gap-1" aria-label="Sections">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`btn px-3 py-1.5 ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`} aria-current={tab === t.key}>
                {t.label}{t.key === 'history' && unused > 0 ? <span className="ml-1 text-xs opacity-70">{unused}</span> : null}
              </button>
            ))}
          </nav>
        </div>
      </header>
      {error && <p className="mb-4 rounded-lg border border-bad/50 bg-bad/10 p-3 text-sm text-bad">{error}</p>}
      {!ready ? <p className="text-mute">Loading…</p> : tab === 'generate' ? <GenerateView /> : tab === 'history' ? <HistoryView /> : tab === 'library' ? <LibraryView /> : <SettingsView />}
      <Toasts />
    </div>
  );
}
