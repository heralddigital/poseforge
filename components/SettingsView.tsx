'use client';
import { useState } from 'react';
import { CATEGORIES } from '@/data/pools';
import { DEFAULT_TEMPLATES, PLACEHOLDERS, cloneTemplates, unknownPlaceholders } from '@/lib/templates';
import { useStore } from '@/lib/store';
import type { PromptMode } from '@/lib/types';

const MODES: PromptMode[] = ['full', 'condensed', 'short'];

export function SettingsView() {
  const st = useStore();
  const { settings, supabase } = st;
  const [mode, setMode] = useState<PromptMode>('full');
  const [sb, setSb] = useState(supabase);
  const tplText = settings.templates.paragraph[mode].join('\n---\n');
  const structured = settings.templates.structured[mode];
  const bad = unknownPlaceholders(`${tplText}\n${structured}`);

  const saveTemplates = (paragraph: string, struct: string) => {
    const t = cloneTemplates(settings.templates);
    t.paragraph[mode] = paragraph.split(/\n---\n/).map((x) => x.trim()).filter(Boolean);
    t.structured[mode] = struct;
    st.updateSettings({ templates: t });
  };

  return (
    <div className="space-y-4">
      <section className="fig-card space-y-3">
        <h2 className="mb-1 text-2xl tracking-[-0.01em]">Character</h2>
        <label className="label" htmlFor="cl">Character lock (prepended to every prompt when enabled)</label>
        <textarea id="cl" className="input min-h-24" value={settings.characterLock} placeholder="e.g. 25-year-old woman with shoulder-length chestnut hair, hazel eyes, light freckles… (keep this identical across prompts)" onChange={(e) => st.updateSettings({ characterLock: e.target.value })} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.characterLockEnabled} onChange={(e) => st.updateSettings({ characterLockEnabled: e.target.checked })} /> Enable character lock</label>
        <label className="label" htmlFor="aa">Always append</label>
        <textarea id="aa" className="input" value={settings.alwaysAppend} placeholder="Text added to the end of every prompt" onChange={(e) => st.updateSettings({ alwaysAppend: e.target.value })} />
        <label className="label" htmlFor="ni">Never include (comma-separated words; any option containing one is skipped)</label>
        <input id="ni" className="input" value={settings.neverInclude} placeholder="e.g. sunglasses, hat, cigarette" onChange={(e) => st.updateSettings({ neverInclude: e.target.value })} />
      </section>

      <section className="fig-card space-y-3">
        <h2 className="mb-1 text-2xl tracking-[-0.01em]">Behaviour</h2>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.autoSave} onChange={(e) => st.updateSettings({ autoSave: e.target.checked })} /> Auto-save generated prompts to History</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.autoMarkUsedOnCopy} onChange={(e) => st.updateSettings({ autoMarkUsedOnCopy: e.target.checked })} /> Mark as “generated” when I copy a prompt</label>
        <label className="flex items-center gap-2 text-sm">Diversity window
          <input type="number" min={0} max={500} className="input w-24" value={settings.diversityWindow} onChange={(e) => st.updateSettings({ diversityWindow: Math.max(0, Number(e.target.value) || 0) })} />
          <span className="text-mute">recent prompts whose location+pose combo is avoided</span>
        </label>
        <div>
          <span className="label">Categories included in prompts</span>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
            {CATEGORIES.map((c) => (
              <label key={c.key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={settings.enabledCategories[c.key] !== false} onChange={(e) => st.updateSettings({ enabledCategories: { ...settings.enabledCategories, [c.key]: e.target.checked } })} />
                {c.label}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="fig-card space-y-3">
        <h2 className="mb-1 text-2xl tracking-[-0.01em]">Templates</h2>
        <div className="flex gap-2">
          {MODES.map((m) => <button key={m} className={`btn ${m === mode ? 'btn-primary' : ''}`} onClick={() => setMode(m)}>{m}</button>)}
          <button className="btn ml-auto" onClick={() => confirm('Restore default templates?') && st.updateSettings({ templates: cloneTemplates(DEFAULT_TEMPLATES) })}>Restore defaults</button>
        </div>
        <p className="text-xs text-mute">
          Placeholders: {PLACEHOLDERS.map((p) => `{${p}}`).join(' ')} · pronouns {'{Subj} {subj} {poss} {obj} {is} {has}'} · <code>[[optional {'{x}'}]]</code> blocks vanish when empty · <code>{'{a+b}'}</code> joins non-empty values.
          Separate paragraph variants with a line containing only <code>---</code>; one is picked per prompt.
        </p>
        <textarea key={`p-${mode}`} className="input min-h-48 font-mono text-xs" defaultValue={tplText} onBlur={(e) => saveTemplates(e.target.value, structured)} aria-label="Paragraph templates" />
        <label className="label">Structured template</label>
        <textarea key={`s-${mode}`} className="input min-h-48 font-mono text-xs" defaultValue={structured} onBlur={(e) => saveTemplates(tplText, e.target.value)} aria-label="Structured template" />
        {bad.length > 0 && <p className="text-xs text-ink">Unknown placeholders (will render empty): {bad.join(', ')}</p>}
      </section>

      <section className="fig-card space-y-3">
        <h2 className="mb-1 text-2xl tracking-[-0.01em]">Storage</h2>
        <p className="text-sm text-mute">
          Currently: <b className="text-ink">{settings.storage}</b>. Local mode keeps everything in this browser (IndexedDB) - clearing site data deletes it, so export JSON occasionally.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="input" placeholder="Supabase project URL" value={sb.url} onChange={(e) => setSb({ ...sb, url: e.target.value })} />
          <input className="input" placeholder="Supabase anon key" type="password" value={sb.anonKey} onChange={(e) => setSb({ ...sb, anonKey: e.target.value })} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={() => st.setSupabase(sb)}>Save credentials (this browser only)</button>
          <button className="btn" onClick={async () => { st.setSupabase(sb); await st.switchStorage('supabase'); }}>Use Supabase</button>
          <button className="btn" onClick={() => st.switchStorage('local')}>Use local</button>
        </div>
        <p className="text-xs text-ink">The Supabase adapter has not been tested against a live project. Run docs/supabase.sql first and read its security warning.</p>
      </section>
    </div>
  );
}
