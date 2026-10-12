import { SEP, pickAll, rerollCategory, resolveSelections, selectionHash } from './engine';
import { assemble, makeTitle } from './assemble';
import { mixSeed, newSeed, uid } from './prng';
import type { GeneratedPrompt, Option, PickConfig, Pool, PromptFormat, PromptMode, Settings } from './types';

export interface GenContext {
  pools: Pool[];
  settings: Settings;
  /** category -> pinned option ids (the Lock feature). */
  pinned: Record<string, string[]>;
  /** Location+pose combos used by recent history items (diversity guard). */
  recentCombos?: Set<string>;
  /** Hashes of every saved prompt (never repeat an identical set of selections). */
  existingHashes?: Set<string>;
}

export interface GenOutcome {
  prompt: GeneratedPrompt;
  attempts: number;
  /** True when the diversity guard could not find an unused combo and let a repeat through. */
  repeated: boolean;
  relaxed: number;
  unresolved: number;
}

export function pickConfigFrom(settings: Settings, pinned: Record<string, string[]>): PickConfig {
  return {
    filters: settings.filters,
    enabledCategories: settings.enabledCategories,
    neverInclude: settings.neverInclude,
    pronoun: settings.pronoun,
    realism: settings.realism,
    pinned
  };
}

export const comboKey = (optionIds: Record<string, string[]>): string =>
  `${(optionIds.location ?? [])[0] ?? '-'}+${(optionIds.pose ?? [])[0] ?? '-'}`;

function idsOf(picks: Record<string, Option[]>): Record<string, string[]> {
  return Object.fromEntries(Object.entries(picks).map(([k, v]) => [k, v.map((o) => o.id)]));
}

function tagsOf(picks: Record<string, Option[]>, base: string[]): string[] {
  const set = new Set<string>(base);
  Object.values(picks).forEach((opts) => opts.forEach((o) => o.tags.forEach((t) => set.add(t))));
  return [...set].sort();
}

function compose(
  seed: number,
  picks: Record<string, Option[]>,
  settings: Settings,
  config: PickConfig,
  base: Partial<GeneratedPrompt> = {}
): GeneratedPrompt {
  const selections = resolveSelections(picks, settings.pronoun);
  const optionIds = idsOf(picks);
  const tags = tagsOf(picks, config.filters.season ?? []);
  const mode: PromptMode = base.mode ?? settings.mode;
  const format: PromptFormat = base.format ?? settings.format;
  const aspect = base.aspect ?? settings.aspect;
  const { text } = assemble({
    selections,
    mode,
    format,
    aspect,
    pronoun: settings.pronoun,
    seed,
    templates: settings.templates,
    characterLock: settings.characterLockEnabled ? settings.characterLock : '',
    alwaysAppend: settings.alwaysAppend
  });
  return {
    id: base.id ?? uid(),
    createdAt: base.createdAt ?? new Date().toISOString(),
    seed,
    title: makeTitle(selections, tags),
    selections,
    optionIds,
    locked: Object.keys(config.pinned ?? {}).filter((k) => (config.pinned[k] ?? []).length > 0),
    mode,
    format,
    aspect,
    promptText: text,
    hash: selectionHash(optionIds),
    tags,
    used: base.used ?? false,
    status: base.status ?? 'unused',
    starred: base.starred ?? false,
    notes: base.notes,
    resultRef: base.resultRef,
    config
  };
}

/** Deterministic: the same seed, pools and settings always produce the same prompt (id/createdAt aside). */
export function generatePrompt(seed: number, ctx: GenContext): GenOutcome {
  const config = pickConfigFrom(ctx.settings, ctx.pinned);
  const result = pickAll(seed, ctx.pools, config);
  const prompt = compose(seed, result.picks, ctx.settings, config);
  return { prompt, attempts: 1, repeated: false, relaxed: result.relaxed, unresolved: result.unresolved };
}

/** Applies the diversity guard: retries new seeds until the location+pose combo and hash are unused. */
export function generateUnique(ctx: GenContext, maxAttempts = 30, firstSeed = newSeed()): GenOutcome {
  let last: GenOutcome | undefined;
  for (let i = 0; i < maxAttempts; i++) {
    const seed = i === 0 ? firstSeed : mixSeed(firstSeed, `retry:${i}`);
    const out = generatePrompt(seed, ctx);
    out.attempts = i + 1;
    last = out;
    const combo = comboKey(out.prompt.optionIds);
    const comboSeen = ctx.recentCombos?.has(combo) ?? false;
    const hashSeen = ctx.existingHashes?.has(out.prompt.hash) ?? false;
    if (!comboSeen && !hashSeen) return out;
  }
  return { ...(last as GenOutcome), repeated: true };
}

/** Re-roll one category of an existing prompt (all other picks stay fixed). */
export function rerollPromptCategory(prompt: GeneratedPrompt, category: string, ctx: GenContext): GeneratedPrompt | null {
  const config = pickConfigFrom(ctx.settings, ctx.pinned);
  const newS = newSeed();
  const replacement = rerollCategory(newS, ctx.pools, config, prompt.optionIds, category);
  if (!replacement) return null;
  const poolMap = new Map(ctx.pools.map((p) => [p.category, p]));
  const picks: Record<string, Option[]> = {};
  for (const [cat, ids] of Object.entries(prompt.optionIds)) {
    const pool = poolMap.get(cat);
    if (!pool) continue;
    picks[cat] = ids.map((id) => pool.options.find((o) => o.id === id)).filter((o): o is Option => !!o);
  }
  picks[category] = replacement;
  const next = compose(newS, picks, ctx.settings, config, prompt);
  return { ...next, locked: prompt.locked };
}

/** Re-render an existing prompt's text from its stored selections (mode/format/aspect/character changes). */
export function reassemble(prompt: GeneratedPrompt, settings: Settings, over: { mode?: PromptMode; format?: PromptFormat } = {}): GeneratedPrompt {
  const mode = over.mode ?? prompt.mode;
  const format = over.format ?? prompt.format;
  const { text } = assemble({
    selections: prompt.selections,
    mode,
    format,
    aspect: prompt.aspect,
    pronoun: settings.pronoun,
    seed: prompt.seed,
    templates: settings.templates,
    characterLock: settings.characterLockEnabled ? settings.characterLock : '',
    alwaysAppend: settings.alwaysAppend
  });
  return { ...prompt, mode, format, promptText: text };
}

export { SEP };
