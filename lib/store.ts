'use client';
import { create } from 'zustand';
import { defaultPools } from '@/data/pools';
import { mergeSettings, defaultSettings } from './defaults';
import { generateUnique, rerollPromptCategory, reassemble, type GenContext } from './generate';
import { allHashes, isUsed, parseImport, recentCombos, withStatus } from './history';
import { LocalAdapter } from './storage/local';
import { SupabaseAdapter } from './storage/supabase';
import type { StorageAdapter } from './storage/types';
import { uid } from './prng';
import type { GeneratedPrompt, Pool, PromptFormat, PromptMode, Settings, Status } from './types';

export type Tab = 'generate' | 'history' | 'library' | 'settings';

export interface Toast {
  id: string;
  message: string;
  undo?: () => void;
}

interface State {
  ready: boolean;
  tab: Tab;
  settings: Settings;
  pools: Pool[];
  prompts: GeneratedPrompt[];
  session: GeneratedPrompt[];
  pinned: Record<string, string[]>;
  toasts: Toast[];
  warning: string | null;
  error: string | null;
  supabase: { url: string; anonKey: string };

  init(): Promise<void>;
  setTab(t: Tab): void;
  generate(count: number): void;
  clearSession(): void;
  saveToHistory(id: string): void;
  reroll(id: string, category: string): void;
  rerollAll(category: string): void;
  togglePin(category: string, optionId: string): void;
  clearPins(): void;
  setPromptView(id: string, over: { mode?: PromptMode; format?: PromptFormat }): void;
  setStatus(ids: string[], status: Status): void;
  toggleStar(id: string): void;
  setNotes(id: string, notes: string): void;
  remove(ids: string[]): void;
  importJSON(json: string): string;
  updateSettings(patch: Partial<Settings>): void;
  updatePools(pools: Pool[]): void;
  resetPools(): void;
  setSupabase(cfg: { url: string; anonKey: string }): void;
  switchStorage(kind: 'local' | 'supabase'): Promise<void>;
  clearAllHistory(): void;
  toast(message: string, undo?: () => void): void;
  dismissToast(id: string): void;
  markCopied(id: string): void;
}

let adapter: StorageAdapter | null = null;
const SB_KEY = 'poseforge:supabase';

function readSupabaseCfg(): { url: string; anonKey: string } {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SB_KEY) : null;
    if (raw) return JSON.parse(raw) as { url: string; anonKey: string };
  } catch { /* storage unavailable */ }
  return { url: '', anonKey: '' };
}

function buildAdapter(kind: 'local' | 'supabase', cfg: { url: string; anonKey: string }): StorageAdapter {
  if (kind === 'supabase' && cfg.url && cfg.anonKey) return new SupabaseAdapter(cfg);
  return new LocalAdapter();
}

/** Persist without ever throwing into the UI; failures surface as a banner. */
function persist(fn: (a: StorageAdapter) => Promise<void>, set: (p: Partial<State>) => void): void {
  if (!adapter) return;
  fn(adapter).then(
    () => set({ error: null }),
    (e: unknown) => set({ error: `Storage error: ${e instanceof Error ? e.message : String(e)}` })
  );
}

const MAX_SESSION = 50;

export const useStore = create<State>((set, get) => {
  const ctx = (): GenContext => {
    const { pools, settings, pinned, prompts } = get();
    return { pools, settings, pinned, recentCombos: recentCombos(prompts, settings.diversityWindow), existingHashes: allHashes(prompts) };
  };

  const patchPrompt = (id: string, fn: (p: GeneratedPrompt) => GeneratedPrompt): void => {
    const { prompts, session } = get();
    let updated: GeneratedPrompt | null = null;
    const apply = (list: GeneratedPrompt[]) => list.map((p) => (p.id === id ? (updated = fn(p)) : p));
    const nextPrompts = apply(prompts);
    const nextSession = apply(session);
    set({ prompts: nextPrompts, session: nextSession });
    const saved = prompts.some((p) => p.id === id);
    if (updated && saved) {
      const u = updated;
      persist((a) => a.savePrompts([u]), set);
    }
  };

  return {
    ready: false,
    tab: 'generate',
    settings: defaultSettings(),
    pools: defaultPools(),
    prompts: [],
    session: [],
    pinned: {},
    toasts: [],
    warning: null,
    error: null,
    supabase: { url: '', anonKey: '' },

    async init() {
      if (get().ready) return;
      const sb = readSupabaseCfg();
      set({ supabase: sb });
      try {
        // Settings live locally first to learn which backend to use.
        const local = new LocalAdapter();
        const localSettings = mergeSettings(await local.loadSettings());
        adapter = buildAdapter(localSettings.storage, sb);
        const remoteSettings = adapter.kind === 'local' ? localSettings : mergeSettings(await adapter.loadSettings());
        const settings = adapter.kind === 'local' ? localSettings : { ...remoteSettings, storage: 'supabase' as const };
        const storedPools = await adapter.loadPools();
        const prompts = await adapter.loadPrompts();
        set({ settings, pools: storedPools && storedPools.length ? storedPools : defaultPools(), prompts, ready: true });
      } catch (e) {
        adapter = new LocalAdapter();
        set({ ready: true, error: `Could not load saved data: ${e instanceof Error ? e.message : String(e)}` });
      }
    },

    setTab: (tab) => set({ tab }),

    generate(count) {
      const { settings } = get();
      const made: GeneratedPrompt[] = [];
      let repeats = 0;
      let relaxed = 0;
      const base = ctx();
      const combos = new Set(base.recentCombos);
      const hashes = new Set(base.existingHashes);
      for (let i = 0; i < count; i++) {
        const out = generateUnique({ ...base, recentCombos: combos, existingHashes: hashes });
        made.push(out.prompt);
        if (out.repeated) repeats++;
        if (out.relaxed > 0 || out.unresolved > 0) relaxed++;
        combos.add(`${(out.prompt.optionIds.location ?? [])[0] ?? '-'}+${(out.prompt.optionIds.pose ?? [])[0] ?? '-'}`);
        hashes.add(out.prompt.hash);
      }
      const warnings: string[] = [];
      if (relaxed > 0) warnings.push(`${relaxed} prompt(s) needed relaxed rules - your filters may be too narrow to satisfy fully.`);
      if (repeats > 0) warnings.push(`${repeats} prompt(s) repeat a recent location+pose combo (pools may be exhausted by your filters).`);
      const session = [...made.reverse(), ...get().session].slice(0, MAX_SESSION);
      set({ session, warning: warnings.length ? warnings.join(' ') : null });
      if (settings.autoSave) {
        set({ prompts: [...made, ...get().prompts] });
        persist((a) => a.savePrompts(made), set);
      }
    },

    clearSession: () => set({ session: [] }),

    saveToHistory(id) {
      const p = get().session.find((x) => x.id === id);
      if (!p || get().prompts.some((x) => x.id === id)) return;
      set({ prompts: [p, ...get().prompts] });
      persist((a) => a.savePrompts([p]), set);
    },

    reroll(id, category) {
      const p = get().session.find((x) => x.id === id) ?? get().prompts.find((x) => x.id === id);
      if (!p) return;
      const next = rerollPromptCategory(p, category, ctx());
      if (!next) { get().toast('No other compatible option for that category'); return; }
      patchPrompt(id, () => ({ ...next, id: p.id, createdAt: p.createdAt }));
    },

    rerollAll(category) {
      get().session.forEach((p) => get().reroll(p.id, category));
    },

    togglePin(category, optionId) {
      const cur = get().pinned[category] ?? [];
      const next = cur.includes(optionId) ? cur.filter((i) => i !== optionId) : [...cur, optionId];
      const pinned = { ...get().pinned };
      if (next.length) pinned[category] = next; else delete pinned[category];
      set({ pinned });
    },
    clearPins: () => set({ pinned: {} }),

    setPromptView(id, over) {
      const { settings } = get();
      patchPrompt(id, (p) => reassemble(p, settings, over));
    },

    setStatus(ids, status) {
      const before = get().prompts.filter((p) => ids.includes(p.id)).map((p) => ({ id: p.id, status: p.status }));
      const idSet = new Set(ids);
      const apply = (list: GeneratedPrompt[]) => list.map((p) => (idSet.has(p.id) ? withStatus(p, status) : p));
      const prompts = apply(get().prompts);
      set({ prompts, session: apply(get().session) });
      const changed = prompts.filter((p) => idSet.has(p.id));
      persist((a) => a.savePrompts(changed), set);
      get().toast(`${ids.length} marked ${status}`, () => {
        const old = new Map(before.map((b) => [b.id, b.status]));
        const revert = (list: GeneratedPrompt[]) => list.map((p) => (old.has(p.id) ? withStatus(p, old.get(p.id) as Status) : p));
        const reverted = revert(get().prompts);
        set({ prompts: reverted, session: revert(get().session) });
        persist((a) => a.savePrompts(reverted.filter((p) => old.has(p.id))), set);
      });
    },

    markCopied(id) {
      const p = get().prompts.find((x) => x.id === id) ?? get().session.find((x) => x.id === id);
      if (p && get().settings.autoMarkUsedOnCopy && !isUsed(p.status) && p.status !== 'rejected') {
        patchPrompt(id, (x) => withStatus(x, 'generated'));
      }
    },

    toggleStar: (id) => patchPrompt(id, (p) => ({ ...p, starred: !p.starred })),
    setNotes: (id, notes) => patchPrompt(id, (p) => ({ ...p, notes: notes || undefined })),

    remove(ids) {
      const idSet = new Set(ids);
      const removed = get().prompts.filter((p) => idSet.has(p.id));
      set({ prompts: get().prompts.filter((p) => !idSet.has(p.id)), session: get().session.filter((p) => !idSet.has(p.id)) });
      persist((a) => a.deletePrompts(ids), set);
      get().toast(`${removed.length} deleted`, () => {
        set({ prompts: [...removed, ...get().prompts] });
        persist((a) => a.savePrompts(removed), set);
      });
    },

    importJSON(json) {
      try {
        const res = parseImport(json, get().prompts);
        set({ prompts: [...res.added, ...get().prompts] });
        persist((a) => a.savePrompts(res.added), set);
        return `Imported ${res.added.length}, skipped ${res.skippedDuplicates} duplicates, ${res.invalid} invalid.`;
      } catch (e) {
        return `Import failed: ${e instanceof Error ? e.message : String(e)}`;
      }
    },

    updateSettings(patch) {
      const settings = mergeSettings({ ...get().settings, ...patch });
      set({ settings });
      // Settings always mirror to the local store (it tells us which backend to use on startup).
      new LocalAdapter().saveSettings(settings).catch(() => undefined);
      if (adapter && adapter.kind !== 'local') persist((a) => a.saveSettings(settings), set);
    },

    updatePools(pools) {
      set({ pools });
      persist((a) => a.savePools(pools), set);
    },
    resetPools() {
      const pools = defaultPools();
      set({ pools });
      persist((a) => a.savePools(pools), set);
    },

    setSupabase(cfg) {
      set({ supabase: cfg });
      try { localStorage.setItem(SB_KEY, JSON.stringify(cfg)); } catch { /* ignore */ }
    },

    async switchStorage(kind) {
      const { supabase, prompts, pools, settings } = get();
      if (kind === 'supabase' && (!supabase.url || !supabase.anonKey)) {
        get().toast('Enter Supabase URL and anon key first');
        return;
      }
      try {
        const next = buildAdapter(kind, supabase);
        // Copy current data to the new backend so nothing is lost on switch.
        const existing = await next.loadPrompts();
        const have = new Set(existing.map((p) => p.id));
        await next.savePrompts(prompts.filter((p) => !have.has(p.id)));
        await next.savePools(pools);
        adapter = next;
        const merged = [...prompts, ...existing.filter((p) => !prompts.some((x) => x.id === p.id))];
        set({ prompts: merged, error: null });
        get().updateSettings({ ...settings, storage: kind });
        get().toast(`Storage: ${kind}`);
      } catch (e) {
        set({ error: `Could not switch storage: ${e instanceof Error ? e.message : String(e)}` });
      }
    },

    clearAllHistory() {
      const all = get().prompts;
      set({ prompts: [], session: [] });
      persist((a) => a.clearPrompts(), set);
      get().toast(`History cleared (${all.length})`, () => {
        set({ prompts: all });
        persist((a) => a.savePrompts(all), set);
      });
    },

    toast(message, undo) {
      const id = uid();
      set({ toasts: [...get().toasts, { id, message, undo }] });
      setTimeout(() => get().dismissToast(id), 6000);
    },
    dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) })
  };
});
