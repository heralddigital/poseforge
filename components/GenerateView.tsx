'use client';
import { useState } from 'react';
import { CATEGORIES, categoryLabel } from '@/data/pools';
import { CAMERA_LOOK_VALUES, SEASON_VALUES, SETTING_VALUES, SHOT_VALUES, TIME_VALUES, VIBE_VALUES } from '@/lib/engine';
import { STYLE_LABELS } from '@/lib/style';
import { useStore } from '@/lib/store';
import type { Filters, PromptFormat, PromptMode } from '@/lib/types';
import { PromptCard } from './PromptCard';
import { Chip } from './ui';

const FILTER_GROUPS: { key: keyof Filters; label: string; values: string[] }[] = [
  { key: 'setting', label: 'Setting', values: SETTING_VALUES },
  { key: 'time', label: 'Time of day', values: TIME_VALUES },
  { key: 'season', label: 'Season / weather', values: SEASON_VALUES },
  { key: 'vibe', label: 'Outfit vibe', values: VIBE_VALUES },
  { key: 'shot', label: 'Shot type', values: SHOT_VALUES },
  { key: 'cameraLook', label: 'Camera look', values: CAMERA_LOOK_VALUES }
];

export function GenerateView() {
  const st = useStore();
  const { settings, session, pinned, warning } = st;
  const [showFilters, setShowFilters] = useState(false);
  const activeFilters = Object.values(settings.filters).reduce((n, v) => n + v.length, 0);
  const pinCount = Object.values(pinned).reduce((n, v) => n + v.length, 0);

  const toggle = (key: keyof Filters, v: string) => {
    const cur = settings.filters[key];
    st.updateSettings({ filters: { ...settings.filters, [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] } });
  };

  return (
    <div className="space-y-4">
      <section className="fig-card space-y-3">
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-signal" onClick={() => st.generate(1)}>Randomize <kbd className="border-on-signal/40">R</kbd></button>
          {[5, 10, 25].map((n) => (
            <button key={n} className="btn" onClick={() => st.generate(n)}>×{n}</button>
          ))}
          <button className="btn ml-auto" onClick={() => setShowFilters(!showFilters)}>
            Filters{activeFilters ? ` (${activeFilters})` : ''}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select className="btn" value={settings.style} onChange={(e) => st.updateSettings({ style: e.target.value as typeof settings.style })} aria-label="Style">
            {(Object.keys(STYLE_LABELS) as (keyof typeof STYLE_LABELS)[]).map((k) => <option key={k} value={k}>{STYLE_LABELS[k]}</option>)}
          </select>
          <select className="btn" value={settings.mode} onChange={(e) => st.updateSettings({ mode: e.target.value as PromptMode })} aria-label="Length">
            <option value="full">Full (250–400 words)</option>
            <option value="condensed">Condensed (150–220)</option>
            <option value="short">Short (60–100)</option>
          </select>
          <select className="btn" value={settings.format} onChange={(e) => st.updateSettings({ format: e.target.value as PromptFormat })} aria-label="Format">
            <option value="paragraph">Paragraph</option>
            <option value="structured">Structured</option>
          </select>
          <select className="btn" value={settings.aspect} onChange={(e) => st.updateSettings({ aspect: e.target.value as typeof settings.aspect })} aria-label="Aspect ratio">
            {['9:16', '4:5', '1:1', '3:4'].map((a) => <option key={a}>{a}</option>)}
          </select>
          <select className="btn" value={settings.pronoun} onChange={(e) => st.updateSettings({ pronoun: e.target.value as typeof settings.pronoun })} aria-label="Pronoun">
            <option value="she">she/her</option><option value="he">he/him</option><option value="they">they/them</option>
          </select>
          <label className="flex items-center gap-2 text-mute">
            Realism
            <input type="range" min={1} max={5} value={settings.realism} onChange={(e) => st.updateSettings({ realism: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })} />
            {settings.realism}
          </label>
          <label className="flex items-center gap-2 text-mute" title="Forces the camera to the iPhone 18 Pro Max front camera, so every shot is an arm-length selfie (no full-body or walking poses)">
            <input type="checkbox" checked={settings.iphoneSelfieLock} onChange={(e) => st.updateSettings({ iphoneSelfieLock: e.target.checked })} />
            iPhone 18 Pro Max selfie
          </label>
          <label className="flex items-center gap-2 text-mute" title="Prepends your Character Lock text (set in Settings)">
            <input type="checkbox" checked={settings.characterLockEnabled} onChange={(e) => st.updateSettings({ characterLockEnabled: e.target.checked })} />
            Character lock {settings.characterLockEnabled && !settings.characterLock.trim() ? '(empty!)' : ''}
          </label>
          <label className="flex items-center gap-2 text-mute">
            <input type="checkbox" checked={settings.autoSave} onChange={(e) => st.updateSettings({ autoSave: e.target.checked })} />
            Auto-save
          </label>
        </div>

        {showFilters && (
          <div className="space-y-3 border-t border-line pt-3">
            {FILTER_GROUPS.map((g) => (
              <div key={g.key}>
                <span className="label">{g.label}</span>
                <div className="flex flex-wrap gap-1.5">
                  {g.values.map((v) => <Chip key={v} on={settings.filters[g.key].includes(v)} onClick={() => toggle(g.key, v)}>{v}</Chip>)}
                </div>
              </div>
            ))}
            <p className="text-xs text-mute">Within a group options are OR-ed; groups are AND-ed. Very narrow combinations may force the engine to relax rules (you will see a warning).</p>
            {activeFilters > 0 && <button className="btn" onClick={() => st.updateSettings({ filters: { setting: [], time: [], season: [], vibe: [], shot: [], cameraLook: [] } })}>Clear filters</button>}
          </div>
        )}

        {pinCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3 text-xs text-mute">
            Pinned:
            {Object.entries(pinned).map(([cat, ids]) => <Chip key={cat} on>{categoryLabel(cat)} ×{ids.length}</Chip>)}
            <button className="btn px-2 py-1" onClick={st.clearPins}>Unpin all</button>
          </div>
        )}
      </section>

      {warning && <p className="border border-line bg-panel2 p-3 text-sm">{warning}</p>}

      {session.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-mute">
          <span>{session.length} in this session</span>
          <span>· re-roll everywhere:</span>
          <select className="btn" value="" onChange={(e) => e.target.value && st.rerollAll(e.target.value)} aria-label="Re-roll a category in all cards">
            <option value="">choose category…</option>
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <button className="btn ml-auto" onClick={st.clearSession}>Clear view</button>
        </div>
      )}

      {session.length === 0 ? (
        <div className="fig-card text-center text-mute">
          Press <b className="text-ink">Randomize</b> (or <kbd>R</kbd>) to create your first prompt. Everything is saved to the History tab automatically.
        </div>
      ) : (
        <div className="space-y-3">
          {session.map((p) => <PromptCard key={p.id} p={p} showSave={!settings.autoSave} />)}
        </div>
      )}
    </div>
  );
}
