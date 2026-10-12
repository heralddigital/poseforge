import { SEP } from './engine';
import { mixSeed, mulberry32 } from './prng';
import { pronounToken } from './pronouns';
import { WORD_BUDGET } from './templates';
import type { AspectRatio, PromptFormat, PromptMode, Pronoun, Templates } from './types';

export interface AssembleInput {
  selections: Record<string, string>;
  mode: PromptMode;
  format: PromptFormat;
  aspect: AspectRatio;
  pronoun: Pronoun;
  seed: number;
  templates: Templates;
  characterLock?: string;
  alwaysAppend?: string;
}

export interface AssembleResult {
  text: string;
  /** Word count of the generated body (excludes Character Lock and Always-append text). */
  words: number;
}

const ASPECT_LABEL: Record<AspectRatio, string> = {
  '9:16': 'vertical 9:16 frame',
  '4:5': 'vertical 4:5 frame',
  '1:1': 'square 1:1 frame',
  '3:4': 'vertical 3:4 frame'
};

/** Categories that are trimmed first when a prompt is over its word budget. */
const TRIM_ORDER = [
  'background', 'makeup', 'accessories', 'motion', 'composition', 'hair', 'imperfection', 'props', 'dof', 'tech',
  'mood', 'angle', 'framing', 'expression', 'lighting', 'time', 'location', 'wardrobe', 'pose', 'camera', 'lens', 'grade'
];
/** Categories that are removed entirely (as a last resort) in Short/Condensed mode. */
const DROP_ORDER = ['makeup', 'background', 'motion', 'composition', 'imperfection', 'tech', 'accessories', 'props', 'dof', 'mood', 'hair', 'angle', 'expression'];

export const wordCount = (text: string): number => (text.trim() ? text.trim().split(/\s+/).length : 0);

/** "a|b|c" -> first `level` parts joined with ", ". */
export function detailText(text: string, level: number): string {
  const parts = text
    .split('|')
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.slice(0, Math.max(1, level)).join(', ');
}

/** The short label used on chips and in titles. */
export const firstPart = (text: string): string => detailText(text.split(SEP)[0] ?? '', 1);

function valueFor(raw: string | undefined, level: number): string {
  if (!raw) return '';
  const items = raw.split(SEP).filter(Boolean);
  if (items.length === 1) return detailText(items[0], level);
  const itemLevel = Math.min(level, 2);
  const rendered = items.map((i) => detailText(i, itemLevel));
  if (rendered.length === 2) return `${rendered[0]} and ${rendered[1]}`;
  return `${rendered.slice(0, -1).join(', ')} and ${rendered[rendered.length - 1]}`;
}

type Levels = Record<string, number>;

function buildValues(selections: Record<string, string>, levels: Levels, dropped: Set<string>, aspect: AspectRatio): Record<string, string> {
  const vals: Record<string, string> = {};
  for (const key of Object.keys(selections)) {
    vals[key] = dropped.has(key) ? '' : valueFor(selections[key], levels[key] ?? 3);
  }
  vals.aspect = ASPECT_LABEL[aspect];
  return vals;
}

function renderTemplate(template: string, vals: Record<string, string>, pronoun: Pronoun, joiner: string): string {
  const lookup = (name: string): string => {
    const token = pronounToken(pronoun, name);
    if (token !== undefined) return token;
    if (name.includes('+')) {
      return name
        .split('+')
        .map((n) => vals[n] ?? '')
        .filter(Boolean)
        .join(joiner);
    }
    return vals[name] ?? '';
  };
  const isPronoun = (name: string) => pronounToken(pronoun, name) !== undefined;

  // optional [[ ]] blocks are dropped when any content placeholder inside them is empty
  const withBlocks = template.replace(/\[\[([^[\]]*)\]\]/g, (_m, inner: string) => {
    const names = [...inner.matchAll(/\{([A-Za-z+]+)\}/g)].map((m) => m[1]);
    const needsContent = names.filter((n) => !isPronoun(n));
    if (needsContent.some((n) => lookup(n) === '')) return '';
    return inner;
  });
  return withBlocks.replace(/\{([A-Za-z+]+)\}/g, (_m, name: string) => lookup(name));
}

export function cleanText(input: string): string {
  let t = input;
  t = t.replace(/[ \t]+\n/g, '\n').replace(/[ \t]{2,}/g, ' ');
  t = t.replace(/\s+([,.;:])/g, '$1');
  t = t.replace(/([,;])\s*([,;.])/g, '$2');
  t = t.replace(/\.{2,}/g, '.');
  t = t.replace(/(^|[.!?]\s+|\n)([a-z])(?!Phone)/g, (_m, pre: string, ch: string) => pre + ch.toUpperCase());
  // drop structured lines with no value
  t = t.replace(/^[A-Z][A-Z &/]*:\s*$/gm, '');
  t = t.replace(/\n{3,}/g, '\n\n');
  return t.trim();
}

export function pickTemplate(templates: Templates, mode: PromptMode, format: PromptFormat, seed: number): string {
  if (format === 'structured') return templates.structured[mode];
  const list = templates.paragraph[mode];
  const rng = mulberry32(mixSeed(seed, 'template'));
  return list[Math.floor(rng() * list.length)] ?? list[0];
}

function renderBody(input: AssembleInput, template: string, levels: Levels, dropped: Set<string>): string {
  const vals = buildValues(input.selections, levels, dropped, input.aspect);
  const joiner = input.format === 'structured' ? '; ' : ', ';
  return cleanText(renderTemplate(template, vals, input.pronoun, joiner));
}

export function assemble(input: AssembleInput): AssembleResult {
  const template = pickTemplate(input.templates, input.mode, input.format, input.seed);
  const [min, max] = WORD_BUDGET[input.mode];
  const startLevel = input.mode === 'full' ? 3 : input.mode === 'condensed' ? 2 : 1;
  const maxLevel = input.mode === 'short' ? 2 : 3;

  const levels: Levels = {};
  for (const key of Object.keys(input.selections)) levels[key] = startLevel;
  const dropped = new Set<string>();

  let body = renderBody(input, template, levels, dropped);

  // too long: reduce detail (low-priority categories first), then drop optional categories
  let guard = 0;
  while (wordCount(body) > max && guard++ < 200) {
    const target = TRIM_ORDER.find((k) => k in levels && !dropped.has(k) && levels[k] > 1);
    if (target) {
      levels[target] -= 1;
    } else if (input.mode !== 'full') {
      const drop = DROP_ORDER.find((k) => k in levels && !dropped.has(k));
      if (!drop) break;
      dropped.add(drop);
    } else {
      break;
    }
    body = renderBody(input, template, levels, dropped);
  }

  // too short: add detail back (high-priority categories first)
  guard = 0;
  while (wordCount(body) < min && guard++ < 200) {
    const target = [...TRIM_ORDER].reverse().find((k) => k in levels && !dropped.has(k) && levels[k] < maxLevel);
    if (!target) break;
    levels[target] += 1;
    const next = renderBody(input, template, levels, dropped);
    if (wordCount(next) > max) {
      levels[target] -= 1;
      break;
    }
    body = next;
  }

  const parts: string[] = [];
  const character = input.characterLock?.trim() ? input.characterLock : '';
  const append = input.alwaysAppend?.trim() ? input.alwaysAppend : '';
  if (character) parts.push(input.format === 'structured' ? `SUBJECT: ${character}` : character);
  parts.push(body);
  if (append) parts.push(append);
  const separator = input.format === 'structured' ? '\n' : '\n\n';
  return { text: parts.join(separator), words: wordCount(body) };
}

const TITLE_STOP = new Set(['the', 'a', 'an', 'toward', 'to', 'with', 'on', 'at', 'in', 'of', 'and', 'while', 'for', 'by', 'from', 'her', 'his', 'their', 'one', 'up', 'over']);
const TIME_TITLES: Array<[string, string]> = [
  ['golden', 'Golden Hour'], ['sunset', 'Sunset'], ['blue', 'Blue Hour'], ['dawn', 'Dawn'], ['night', 'Night'],
  ['snow', 'Snowy'], ['rain', 'Rainy'], ['mist', 'Misty'], ['overcast', 'Overcast'], ['midday', 'Midday'],
  ['morning', 'Morning'], ['afternoon', 'Afternoon'], ['artificial', 'Indoor']
];

const SMALL_WORDS = new Set(['the', 'a', 'an', 'to', 'toward', 'with', 'on', 'at', 'in', 'of', 'and', 'while', 'for', 'by', 'from', 'over', 'up', 'down']);

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

function locationLabel(text: string): string {
  let t = firstPart(text).replace(/^(a|an|the)\s+/i, '');
  t = t.split(/\s(?:with|in|on|at|beside|overlooking|lined|covered|above|under|over|inside|climbing|leading|parked)\s/i)[0];
  const words = t.split(/\s+/).filter(Boolean);
  return titleCase(words.slice(-3).join(' '));
}

function poseLabel(text: string): string {
  const cut = firstPart(text).replace(/\{[a-z]+\}/gi, '').split(/\s(?:with|while|and|as)\s/)[0];
  const words = cut.split(/\s+/).filter(Boolean).slice(0, 5);
  while (words.length > 1 && TITLE_STOP.has(words[words.length - 1].toLowerCase())) words.pop();
  return titleCase(words.join(' '));
}

export function makeTitle(selections: Record<string, string>, tags: string[]): string {
  const time = TIME_TITLES.find(([tag]) => tags.includes(tag))?.[1] ?? '';
  const loc = selections.location ? locationLabel(selections.location) : '';
  const pose = selections.pose ? poseLabel(selections.pose) : '';
  const left = [time, loc].filter(Boolean).join(' ');
  return [left, pose].filter(Boolean).join(' – ') || 'Untitled pose';
}
