'use client';
import { useState } from 'react';
import { CATEGORIES } from '@/data/pools';
import { wordCount } from '@/lib/assemble';
import { SEP } from '@/lib/engine';
import { useStore } from '@/lib/store';
import type { GeneratedPrompt, PromptFormat, PromptMode, Status } from '@/lib/types';
import { STATUS_STYLE, copyText } from './ui';

const STATUSES: Status[] = ['unused', 'generated', 'posted', 'rejected'];
const SHOWN = ['location', 'time', 'wardrobe', 'pose', 'camera', 'lens', 'angle', 'lighting', 'grade'];

export function PromptCard({
  p,
  selectable,
  selected,
  onSelect,
  showSave
}: {
  p: GeneratedPrompt;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  showSave?: boolean;
}) {
  const st = useStore();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(p.notes ?? '');
  const saved = st.prompts.some((x) => x.id === p.id);
  const pinned = st.pinned;

  const copy = async () => {
    const ok = await copyText(p.promptText);
    st.toast(ok ? 'Prompt copied' : 'Copy failed - select the text manually');
    if (ok) st.markCopied(p.id);
  };

  return (
    <article className={`card space-y-3 ${selected ? 'border-accent' : ''}`}>
      <header className="flex items-start gap-2">
        {selectable && (
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[#c4a7ff]" checked={!!selected} onChange={onSelect} aria-label="Select prompt" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{p.title}</h3>
          <p className="text-xs text-mute">
            {new Date(p.createdAt).toLocaleString()} · {wordCount(p.promptText)} words · seed {p.seed}
          </p>
        </div>
        <span className={`chip ${STATUS_STYLE[p.status]}`}>{p.status}</span>
        <button className="btn-ghost btn px-2" onClick={() => st.toggleStar(p.id)} aria-label="Star" title="Star">
          {p.starred ? '★' : '☆'}
        </button>
      </header>

      <p className="whitespace-pre-wrap rounded-lg bg-bg/60 p-3 text-sm leading-relaxed text-ink/90">{p.promptText}</p>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={copy}>Copy</button>
        {showSave && !saved && <button className="btn" onClick={() => st.saveToHistory(p.id)}>Save</button>}
        <select className="btn" value={p.status} onChange={(e) => st.setStatus([p.id], e.target.value as Status)} aria-label="Status">
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="btn" value={p.mode} onChange={(e) => st.setPromptView(p.id, { mode: e.target.value as PromptMode })} aria-label="Length">
          <option value="full">Full</option><option value="condensed">Condensed</option><option value="short">Short</option>
        </select>
        <select className="btn" value={p.format} onChange={(e) => st.setPromptView(p.id, { format: e.target.value as PromptFormat })} aria-label="Format">
          <option value="paragraph">Paragraph</option><option value="structured">Structured</option>
        </select>
        <button className="btn" onClick={() => setOpen(!open)}>{open ? 'Hide details' : 'Details'}</button>
        <button className="btn text-bad" onClick={() => st.remove([p.id])}>Delete</button>
      </div>

      {open && (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {CATEGORIES.filter((c) => p.selections[c.key]).map((c) => {
              const isPinned = (pinned[c.key] ?? []).length > 0;
              return (
                <div key={c.key} className="rounded-lg border border-line p-2 text-xs">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium text-mute">{c.label}</span>
                    <span className="flex gap-1">
                      <button className="chip" onClick={() => st.reroll(p.id, c.key)} title="Re-roll just this part">↻</button>
                      <button
                        className={`chip ${isPinned ? 'chip-on' : ''}`}
                        title="Pin: keep this option in future generations"
                        onClick={() => (p.optionIds[c.key] ?? []).forEach((id) => st.togglePin(c.key, id))}
                      >
                        {isPinned ? 'pinned' : 'pin'}
                      </button>
                    </span>
                  </div>
                  <div className="text-ink/90">{p.selections[c.key].split(SEP).join(' • ')}</div>
                </div>
              );
            })}
          </div>
          <label className="label" htmlFor={`n-${p.id}`}>Notes</label>
          <textarea
            id={`n-${p.id}`}
            className="input min-h-16"
            value={notes}
            placeholder="Result link, what worked, tweaks..."
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => notes !== (p.notes ?? '') && st.setNotes(p.id, notes)}
          />
        </div>
      )}
      {!open && (
        <p className="truncate text-xs text-mute">{SHOWN.map((k) => p.selections[k]?.split('|')[0]).filter(Boolean).slice(0, 4).join(' · ')}</p>
      )}
    </article>
  );
}
