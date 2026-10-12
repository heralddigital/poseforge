'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { defaultQuery, exportCSV, exportJSON, filterHistory, historyStats, type HistoryQuery, type SortKey, type StatusFilter } from '@/lib/history';
import { useStore } from '@/lib/store';
import { PromptCard } from './PromptCard';
import { Chip, download } from './ui';

const PAGE = 20;
const FILTERS: StatusFilter[] = ['all', 'unused', 'generated', 'posted', 'rejected', 'starred'];

export function HistoryView() {
  const st = useStore();
  const [q, setQ] = useState<HistoryQuery>(defaultQuery());
  const [limit, setLimit] = useState(PAGE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState('');
  const sentinel = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => historyStats(st.prompts), [st.prompts]);
  const items = useMemo(() => filterHistory(st.prompts, q), [st.prompts, q]);
  const visible = items.slice(0, limit);

  useEffect(() => setLimit(PAGE), [q]);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && setLimit((l) => l + PAGE), { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [items.length]);

  const toggleSel = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const ids = [...selected];
  const stamp = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <section className="card space-y-3">
        <div className="flex flex-wrap gap-3 text-sm">
          <span><b>{stats.total}</b> total</span>
          <span className="text-mute"><b className="text-ink">{stats.unused}</b> unused</span>
          <span className="text-ok"><b>{stats.generated}</b> generated</span>
          <span className="text-accent"><b>{stats.posted}</b> posted</span>
          <span className="text-bad"><b>{stats.rejected}</b> rejected</span>
          <span><b>{stats.starred}</b> ★</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => <Chip key={f} on={q.status === f} onClick={() => setQ({ ...q, status: f })}>{f}</Chip>)}
        </div>
        <div className="flex flex-wrap gap-2">
          <input id="history-search" className="input max-w-xs" placeholder="Search prompts, titles, notes ( / )" value={q.search} onChange={(e) => setQ({ ...q, search: e.target.value })} />
          <select className="btn" value={q.sort} onChange={(e) => setQ({ ...q, sort: e.target.value as SortKey })} aria-label="Sort">
            <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="starred">Starred first</option><option value="status">By status</option>
          </select>
          <button className="btn" onClick={() => download(`poseforge-${stamp}.json`, exportJSON(st.prompts), 'application/json')}>Export JSON</button>
          <button className="btn" onClick={() => download(`poseforge-${stamp}.csv`, exportCSV(st.prompts), 'text/csv')}>Export CSV</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Import JSON</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setMsg(st.importJSON(await f.text()));
              e.target.value = '';
            }}
          />
        </div>
        {msg && <p className="text-xs text-mute">{msg}</p>}
      </section>

      {selected.size > 0 && (
        <div className="sticky top-14 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-accent/60 bg-panel2 p-3 text-sm">
          <b>{selected.size} selected</b>
          <button className="btn" onClick={() => { st.setStatus(ids, 'generated'); setSelected(new Set()); }}>Mark generated</button>
          <button className="btn" onClick={() => { st.setStatus(ids, 'posted'); setSelected(new Set()); }}>Mark posted</button>
          <button className="btn" onClick={() => { st.setStatus(ids, 'rejected'); setSelected(new Set()); }}>Reject</button>
          <button className="btn" onClick={() => { st.setStatus(ids, 'unused'); setSelected(new Set()); }}>Mark unused</button>
          <button className="btn" onClick={() => { download('poseforge-selection.json', exportJSON(st.prompts.filter((p) => selected.has(p.id))), 'application/json'); }}>Export</button>
          <button className="btn text-bad" onClick={() => { st.remove(ids); setSelected(new Set()); }}>Delete</button>
          <button className="btn ml-auto" onClick={() => setSelected(new Set())}>Cancel</button>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-mute">
        <span>{items.length} shown</span>
        {items.length > 0 && <button className="underline" onClick={() => setSelected(new Set(items.map((p) => p.id)))}>select all {items.length}</button>}
        {items.length > 0 && stats.total > 0 && (
          <button className="ml-auto text-bad underline" onClick={() => confirm('Delete ALL history? You can undo right after.') && st.clearAllHistory()}>clear all history</button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card text-center text-mute">{stats.total === 0 ? 'No saved prompts yet. Generate some first.' : 'Nothing matches those filters.'}</div>
      ) : (
        <div className="space-y-3">
          {visible.map((p) => <PromptCard key={p.id} p={p} selectable selected={selected.has(p.id)} onSelect={() => toggleSel(p.id)} />)}
          <div ref={sentinel} className="h-8" />
        </div>
      )}
    </div>
  );
}
