'use client';
import { useMemo, useState } from 'react';
import { CATEGORIES } from '@/data/pools';
import { useStore } from '@/lib/store';
import type { Option, Pool } from '@/lib/types';

const splitList = (v: string): string[] => v.split(/[\s,]+/).filter(Boolean);

export function LibraryView() {
  const { pools, updatePools, resetPools } = useStore();
  const [cat, setCat] = useState(CATEGORIES[0].key);
  const [filter, setFilter] = useState('');
  const [adding, setAdding] = useState('');
  const pool = pools.find((p) => p.category === cat);

  const options = useMemo(() => {
    const n = filter.trim().toLowerCase();
    return (pool?.options ?? []).filter((o) => !n || o.text.toLowerCase().includes(n) || o.tags.some((t) => t.includes(n)));
  }, [pool, filter]);

  const mutate = (fn: (opts: Option[]) => Option[]) =>
    updatePools(pools.map((p): Pool => (p.category === cat ? { ...p, options: fn(p.options) } : p)));
  const edit = (id: string, patch: Partial<Option>) => mutate((opts) => opts.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  const addOption = () => {
    const text = adding.trim();
    if (!text) return;
    mutate((opts) => {
      const n = opts.reduce((m, o) => Math.max(m, Number(o.id.split('-').pop()) || 0), 0) + 1;
      return [...opts, { id: `${cat}-${String(n).padStart(3, '0')}`, text, weight: 1, tags: [], enabled: true }];
    });
    setAdding('');
  };

  return (
    <div className="space-y-4">
      <section className="card space-y-3">
        <p className="text-sm text-mute">
          Every dropdown choice the generator uses lives here. Separate detail levels with <code className="text-accent">|</code> (short | condensed | full).
          Tags drive compatibility: <i>requires</i> entries must all be present in the rest of the prompt (<code>a|b</code> = either), <i>excludes</i> must be absent.
        </p>
        <div className="flex flex-wrap gap-2">
          <select className="btn" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label} ({pools.find((p) => p.category === c.key)?.options.filter((o) => o.enabled).length}/{pools.find((p) => p.category === c.key)?.options.length})</option>)}
          </select>
          <input className="input max-w-xs" placeholder="Filter text or tag" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <button className="btn ml-auto text-bad" onClick={() => confirm('Reset ALL pools to defaults? Your edits will be lost.') && resetPools()}>Reset all pools</button>
        </div>
        <div className="flex gap-2">
          <input className="input" placeholder="Add a new option (text)…" value={adding} onChange={(e) => setAdding(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addOption()} />
          <button className="btn btn-primary" onClick={addOption}>Add</button>
        </div>
      </section>

      <div className="space-y-2">
        {options.map((o) => (
          <div key={o.id} className={`card space-y-2 ${o.enabled ? '' : 'opacity-50'}`}>
            <div className="flex items-start gap-2">
              <input type="checkbox" className="mt-2 h-4 w-4 accent-[#c4a7ff]" checked={o.enabled} onChange={(e) => edit(o.id, { enabled: e.target.checked })} aria-label="Enabled" />
              <textarea className="input min-h-12" defaultValue={o.text} key={o.id + o.text} onBlur={(e) => e.target.value !== o.text && edit(o.id, { text: e.target.value })} />
              <button className="btn text-bad px-2" onClick={() => mutate((opts) => opts.filter((x) => x.id !== o.id))} aria-label="Delete option">✕</button>
            </div>
            <div className="grid gap-2 text-xs sm:grid-cols-4">
              <label>Weight
                <input type="number" min={0} step={0.5} className="input" defaultValue={o.weight} onBlur={(e) => edit(o.id, { weight: Math.max(0, Number(e.target.value) || 0) })} />
              </label>
              <label>Tags
                <input className="input" defaultValue={o.tags.join(' ')} onBlur={(e) => edit(o.id, { tags: splitList(e.target.value) })} />
              </label>
              <label>Requires
                <input className="input" defaultValue={(o.requires ?? []).join(' ')} onBlur={(e) => edit(o.id, { requires: splitList(e.target.value) })} />
              </label>
              <label>Excludes
                <input className="input" defaultValue={(o.excludes ?? []).join(' ')} onBlur={(e) => edit(o.id, { excludes: splitList(e.target.value) })} />
              </label>
            </div>
          </div>
        ))}
        {options.length === 0 && <div className="card text-center text-mute">No options match.</div>}
      </div>
    </div>
  );
}
