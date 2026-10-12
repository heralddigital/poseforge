import { CATEGORIES } from '@/data/pools';
import { CONFLICTS, RULES } from './rules';
import { fnv1a, mixSeed, mulberry32 } from './prng';
import { resolvePronouns } from './pronouns';
import type { Filters, Option, PickConfig, Pool } from './types';

export const SEP = ' || ';

export const SETTING_VALUES = ['indoor', 'outdoor', 'urban', 'nature', 'travel', 'home', 'gym', 'cafe', 'beach', 'car', 'nightlife'];
export const TIME_VALUES = ['dawn', 'morning', 'midday', 'afternoon', 'golden', 'blue', 'night'];
export const SEASON_VALUES = ['spring', 'summer', 'autumn', 'winter', 'sunny', 'overcast', 'rain', 'mist', 'snow'];
export const VIBE_VALUES = ['cleangirl', 'oldmoney', 'streetwear', 'cozy', 'luxtravel', 'athleisure', 'boho', 'minimalist', 'y2k', 'coquette', 'quietluxury', 'gymcore'];
export const SHOT_VALUES = ['full', 'threeq', 'waist', 'closeup', 'detail'];
export const CAMERA_LOOK_VALUES = ['phone', 'digital', 'film', 'compact', 'cinema'];

/** Maps a camera-look filter value to the option tags that satisfy it. */
const CAMERA_LOOK_TAGS: Record<string, string[]> = {
  phone: ['phone'],
  digital: ['body-ilc'],
  film: ['film'],
  compact: ['compact'],
  cinema: ['cinema']
};

const UNIQUE_TAGS = ['hat', 'bag', 'glasses', 'scarf', 'watch', 'hairacc', 'gloves', 'belt', 'audio'];

interface FilterSpec {
  key: keyof Filters;
  category: string;
  groupTags: string[];
  tagsFor: (value: string) => string[];
}

const identity = (v: string) => [v];
const FILTER_SPECS: FilterSpec[] = [
  { key: 'setting', category: 'location', groupTags: SETTING_VALUES, tagsFor: identity },
  { key: 'time', category: 'time', groupTags: TIME_VALUES, tagsFor: identity },
  { key: 'season', category: 'time', groupTags: SEASON_VALUES, tagsFor: identity },
  { key: 'vibe', category: 'wardrobe', groupTags: VIBE_VALUES, tagsFor: identity },
  { key: 'vibe', category: 'mood', groupTags: VIBE_VALUES, tagsFor: identity },
  { key: 'shot', category: 'framing', groupTags: SHOT_VALUES, tagsFor: identity },
  {
    key: 'cameraLook',
    category: 'camera',
    groupTags: CAMERA_LOOK_VALUES.flatMap((v) => CAMERA_LOOK_TAGS[v]),
    tagsFor: (v) => CAMERA_LOOK_TAGS[v] ?? [v]
  }
];

export interface PickResult {
  picks: Record<string, Option[]>;
  tags: string[];
  /** Number of categories where compatibility had to be relaxed to find any option. */
  relaxed: number;
  /** Categories that still violate a rule after the coherence pass. */
  unresolved: number;
  relaxedCategories: string[];
  unresolvedCategories: string[];
}

interface Env {
  config: PickConfig;
  banned: string[];
  baseTags: string[];
  poolMap: Map<string, Pool>;
}

/**
 * Lookahead: an early pick is only accepted when at least one option in each listed downstream
 * category could still be chosen, so filters (night, close-up, a vibe...) never dead-end later on.
 */
const DOWNSTREAM: Record<string, string[]> = {
  location: ['time', 'wardrobe'],
  time: ['wardrobe'],
  pose: ['framing']
};

export const parseBanned = (value: string): string[] =>
  value
    .split(/[\n,]/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);

const hasAny = (set: Set<string>, tags: string[]) => tags.some((t) => set.has(t));

function requirementsMet(option: Option, ctx: Set<string>): boolean {
  for (const req of option.requires ?? []) {
    if (!req.split('|').some((t) => ctx.has(t))) return false;
  }
  if (hasAny(ctx, option.excludes ?? [])) return false;
  return true;
}

function conflictFree(option: Option, ctx: Set<string>): boolean {
  const own = new Set(option.tags);
  for (const [a, b] of CONFLICTS) {
    if ((own.has(a) && ctx.has(b)) || (own.has(b) && ctx.has(a))) return false;
  }
  return true;
}

function ruleCheck(option: Option, category: string, ctx: Set<string>, includeNeeds: boolean): boolean {
  for (const rule of RULES) {
    if (rule.category && rule.category !== category) continue;
    if (!rule.when.every((t) => ctx.has(t))) continue;
    if (rule.unless && rule.unless.some((t) => ctx.has(t))) continue;
    if (rule.exempt && option.tags.some((t) => rule.exempt!.includes(t))) continue;
    if (rule.forbid && option.tags.some((t) => rule.forbid!.includes(t))) return false;
    if (includeNeeds && rule.needAny && !option.tags.some((t) => rule.needAny!.includes(t))) return false;
  }
  return true;
}

function filterPass(option: Option, category: string, filters: Filters): boolean {
  for (const spec of FILTER_SPECS) {
    if (spec.category !== category) continue;
    const selected = filters[spec.key];
    if (!selected || selected.length === 0) continue;
    const wanted = selected.flatMap(spec.tagsFor);
    const inGroup = option.tags.filter((t) => spec.groupTags.includes(t));
    if (inGroup.length === 0) continue; // neutral options always pass
    if (!inGroup.some((t) => wanted.includes(t))) return false;
  }
  return true;
}

/** relax: 0 = everything, 1 = skip needAny rules, 2 = skip rules+conflicts, 3 = skip requires/excludes, 4 = skip filters too. */
function eligible(option: Option, category: string, ctx: Set<string>, env: Env, relax: number): boolean {
  if (!option.enabled) return false;
  if (env.banned.length) {
    const lower = option.text.toLowerCase();
    if (env.banned.some((w) => lower.includes(w))) return false;
  }
  if (relax < 4 && !filterPass(option, category, env.config.filters)) return false;
  if (relax < 3 && !requirementsMet(option, ctx)) return false;
  if (relax < 2 && !conflictFree(option, ctx)) return false;
  if (relax < 2 && !ruleCheck(option, category, ctx, relax < 1)) return false;
  return true;
}

function effectiveWeight(option: Option, category: string, realism: number): number {
  let w = Math.max(0, option.weight);
  if (category === 'imperfection' || category === 'tech') {
    const delta = realism - 3;
    if (option.tags.includes('real')) w *= Math.max(0.2, 1 + delta * 0.35);
    if (option.tags.includes('clean')) w *= Math.max(0.2, 1 - delta * 0.25);
  }
  return w;
}

function weightedPick(candidates: Option[], category: string, realism: number, rng: () => number): Option | undefined {
  if (candidates.length === 0) return undefined;
  const weights = candidates.map((c) => effectiveWeight(c, category, realism));
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return candidates[Math.floor(rng() * candidates.length)];
  let r = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

export function pickCount(category: string, realism: number, rng: () => number): number {
  if (category === 'imperfection') {
    const table: Record<number, [number, number]> = { 1: [1, 1], 2: [1, 2], 3: [2, 2], 4: [2, 3], 5: [3, 3] };
    const [lo, hi] = table[Math.min(5, Math.max(1, Math.round(realism)))];
    return lo + (hi > lo && rng() < 0.5 ? 1 : 0);
  }
  if (category === 'accessories') return rng() < 0.55 ? 1 : 2;
  const meta = CATEGORIES.find((c) => c.key === category);
  return meta ? meta.picks[0] : 1;
}

function ctxOf(picks: Record<string, Option[]>, base: string[], skip?: string): Set<string> {
  const ctx = new Set<string>(base);
  for (const [cat, opts] of Object.entries(picks)) {
    if (cat === skip) continue;
    for (const o of opts) o.tags.forEach((t) => ctx.add(t));
  }
  return ctx;
}

function feasible(option: Option, category: string, ctx: Set<string>, env: Env, fixed: Record<string, Option[]>): boolean {
  const down = DOWNSTREAM[category];
  if (!down) return true;
  const ctx2 = new Set(ctx);
  option.tags.forEach((t) => ctx2.add(t));
  for (const d of down) {
    if (env.config.enabledCategories[d] === false || fixed[d]) continue;
    const pool = env.poolMap.get(d);
    if (!pool) continue;
    if (!pool.options.some((o) => eligible(o, d, ctx2, env, 0))) return false;
  }
  return true;
}

function pickCategory(
  pool: Pool,
  category: string,
  ctx: Set<string>,
  env: Env,
  rng: () => number,
  count: number,
  fixed: Record<string, Option[]> = {}
): { chosen: Option[]; relaxed: boolean } {
  const chosen: Option[] = [];
  let relaxedFlag = false;
  const localCtx = new Set(ctx);
  for (let n = 0; n < count; n++) {
    let candidates: Option[] = [];
    let level = 0;
    for (; level <= 4; level++) {
      candidates = pool.options.filter((o) => !chosen.includes(o) && eligible(o, category, localCtx, env, level));
      if (n > 0) {
        const used = new Set(chosen.flatMap((c) => c.tags.filter((t) => UNIQUE_TAGS.includes(t))));
        candidates = candidates.filter((o) => !o.tags.some((t) => used.has(t)));
      }
      if (candidates.length > 0) {
        if (level === 0 && DOWNSTREAM[category]) {
          const ok = candidates.filter((o) => feasible(o, category, localCtx, env, fixed));
          if (ok.length > 0) candidates = ok;
        }
        break;
      }
    }
    if (candidates.length === 0) break;
    if (level > 0 && n === 0) relaxedFlag = true;
    const pick = weightedPick(candidates, category, env.config.realism, rng);
    if (!pick) break;
    chosen.push(pick);
    pick.tags.forEach((t) => localCtx.add(t));
  }
  return { chosen, relaxed: relaxedFlag };
}

export function baseTagsFor(filters: Filters): string[] {
  return [...(filters.season ?? [])];
}

export function pickAll(seed: number, pools: Pool[], config: PickConfig, maxPasses = 6): PickResult {
  const rng = mulberry32(seed);
  const poolMap = new Map(pools.map((p) => [p.category, p]));
  const env: Env = { config, banned: parseBanned(config.neverInclude ?? ''), baseTags: baseTagsFor(config.filters), poolMap };
  const keys = CATEGORIES.map((c) => c.key).filter((k) => config.enabledCategories[k] !== false && poolMap.has(k));

  const picks: Record<string, Option[]> = {};
  const locked = new Set<string>();
  let relaxed = 0;
  const relaxedCategories: string[] = [];

  // pinned (locked) options first so they inform every other pick
  for (const key of keys) {
    const ids = config.pinned?.[key];
    if (!ids || ids.length === 0) continue;
    const found = ids.map((id) => poolMap.get(key)!.options.find((o) => o.id === id)).filter((o): o is Option => !!o);
    if (found.length) {
      picks[key] = found;
      locked.add(key);
    }
  }

  // forward pass in category order
  const forward: Record<string, Option[]> = { ...picks };
  for (const key of keys) {
    if (locked.has(key)) continue;
    const ctx = ctxOf(forward, env.baseTags);
    const count = pickCount(key, config.realism, rng);
    const { chosen, relaxed: r } = pickCategory(poolMap.get(key)!, key, ctx, env, rng, count, forward);
    if (r) {
      relaxed++;
      relaxedCategories.push(key);
    }
    if (chosen.length) {
      forward[key] = chosen;
      picks[key] = chosen;
    }
  }

  // coherence pass: re-roll categories that conflict with the final context
  let unresolved = 0;
  let unresolvedCategories: string[] = [];
  for (let pass = 0; pass < maxPasses; pass++) {
    let changed = false;
    unresolved = 0;
    unresolvedCategories = [];
    for (const key of keys) {
      if (locked.has(key) || !picks[key]) continue;
      const ctx = ctxOf(picks, env.baseTags, key);
      const bad = picks[key].some((o) => !requirementsMet(o, ctx) || !conflictFree(o, ctx) || !ruleCheck(o, key, ctx, true));
      if (!bad) continue;
      const { chosen } = pickCategory(poolMap.get(key)!, key, ctx, env, rng, picks[key].length);
      // only accept a replacement that is strictly valid
      const valid = chosen.length > 0 && chosen.every((o) => requirementsMet(o, ctx) && conflictFree(o, ctx) && ruleCheck(o, key, ctx, true));
      if (valid) {
        picks[key] = chosen;
        changed = true;
      } else {
        unresolved++;
        unresolvedCategories.push(key);
      }
    }
    if (!changed) break;
  }

  const tags = new Set<string>(env.baseTags);
  Object.values(picks).forEach((opts) => opts.forEach((o) => o.tags.forEach((t) => tags.add(t))));
  return { picks, tags: [...tags].sort(), relaxed, unresolved, relaxedCategories, unresolvedCategories };
}

/** Pick a single replacement for one category while keeping everything else fixed. */
export function rerollCategory(
  seed: number,
  pools: Pool[],
  config: PickConfig,
  current: Record<string, string[]>,
  category: string
): Option[] | null {
  const rng = mulberry32(mixSeed(seed, `reroll:${category}`));
  const poolMap = new Map(pools.map((p) => [p.category, p]));
  const env: Env = { config, banned: parseBanned(config.neverInclude ?? ''), baseTags: baseTagsFor(config.filters), poolMap };
  const picks: Record<string, Option[]> = {};
  for (const [cat, ids] of Object.entries(current)) {
    const pool = poolMap.get(cat);
    if (!pool) continue;
    picks[cat] = ids.map((id) => pool.options.find((o) => o.id === id)).filter((o): o is Option => !!o);
  }
  const pool = poolMap.get(category);
  if (!pool) return null;
  const ctx = ctxOf(picks, env.baseTags, category);
  const previous = new Set(current[category] ?? []);
  const count = Math.max(1, previous.size || pickCount(category, config.realism, rng));
  // try to avoid re-picking the same option
  const trimmed: Pool = { category, options: pool.options.filter((o) => !previous.has(o.id) || pool.options.length <= count) };
  const { chosen } = pickCategory(trimmed, category, ctx, env, rng, count);
  return chosen.length ? chosen : null;
}

export function resolveSelections(picks: Record<string, Option[]>, pronoun: PickConfig['pronoun']): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [cat, opts] of Object.entries(picks)) {
    out[cat] = opts.map((o) => resolvePronouns(o.text, pronoun)).join(SEP);
  }
  return out;
}

export function selectionHash(optionIds: Record<string, string[]>): string {
  const canon = Object.keys(optionIds)
    .sort()
    .map((k) => `${k}:${[...optionIds[k]].sort().join(',')}`)
    .join(';');
  return fnv1a(canon);
}

