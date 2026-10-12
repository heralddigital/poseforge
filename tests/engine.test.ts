import { describe, expect, it } from 'vitest';
import { defaultPools, CATEGORIES } from '@/data/pools';
import { defaultSettings } from '@/lib/defaults';
import { generatePrompt, generateUnique, rerollPromptCategory, type GenContext } from '@/lib/generate';
import { WORD_BUDGET } from '@/lib/templates';
import { wordCount } from '@/lib/assemble';
import { CONFLICTS } from '@/lib/rules';
import type { PromptMode } from '@/lib/types';

const ctx = (over: Partial<GenContext> = {}): GenContext => ({ pools: defaultPools(), settings: defaultSettings(), pinned: {}, ...over });

describe('pools', () => {
  it('has enough options per category', () => {
    for (const p of defaultPools()) expect(p.options.length, p.category).toBeGreaterThanOrEqual(10);
  });
  it('has unique ids and positive weights', () => {
    for (const p of defaultPools()) {
      const ids = new Set(p.options.map((o) => o.id));
      expect(ids.size).toBe(p.options.length);
      p.options.forEach((o) => expect(o.weight).toBeGreaterThan(0));
    }
  });
});

describe('seeded generation', () => {
  it('is reproducible', () => {
    const a = generatePrompt(12345, ctx()).prompt;
    const b = generatePrompt(12345, ctx()).prompt;
    expect(a.promptText).toBe(b.promptText);
    expect(a.hash).toBe(b.hash);
  });
  it('differs across seeds', () => {
    const texts = new Set(Array.from({ length: 20 }, (_, i) => generatePrompt(i + 1, ctx()).prompt.promptText));
    expect(texts.size).toBeGreaterThan(18);
  });
  it('fills every category by default', () => {
    const p = generatePrompt(7, ctx()).prompt;
    for (const c of CATEGORIES) expect(p.optionIds[c.key]?.length, c.key).toBeGreaterThan(0);
  });
});

describe('compatibility rules', () => {
  it('never produces a hard-conflicting tag pair', () => {
    for (let i = 0; i < 400; i++) {
      const p = generatePrompt(i * 7 + 1, ctx());
      if (p.relaxed || p.unresolved) continue;
      const tags = new Set(p.prompt.tags);
      for (const [a, b] of CONFLICTS.filter(([x, y]) => x !== y)) expect(tags.has(a) && tags.has(b), `${a}/${b} seed ${i * 7 + 1}`).toBe(false);
    }
  });
  it('rarely needs relaxed rules with default settings', () => {
    let relaxed = 0;
    for (let i = 0; i < 300; i++) { const o = generatePrompt(i + 100, ctx()); if (o.relaxed || o.unresolved) relaxed++; }
    expect(relaxed).toBe(0);
  });
  it('honours filters', () => {
    const settings = defaultSettings();
    settings.filters.setting = ['beach'];
    for (let i = 0; i < 40; i++) {
      const o = generatePrompt(i + 5, ctx({ settings }));
      expect(o.prompt.tags).toContain('beach');
    }
  });
  it('honours never-include', () => {
    const settings = defaultSettings();
    settings.neverInclude = 'sunglasses';
    for (let i = 0; i < 100; i++) expect(generatePrompt(i + 1, ctx({ settings })).prompt.promptText.toLowerCase()).not.toContain('sunglasses');
  });
  it('honours pins', () => {
    const pools = defaultPools();
    const target = pools.find((p) => p.category === 'camera')!.options[3].id;
    for (let i = 0; i < 30; i++) {
      const o = generatePrompt(i + 1, ctx({ pools, pinned: { camera: [target] } }));
      expect(o.prompt.optionIds.camera).toContain(target);
    }
  });
});

describe('word budgets', () => {
  for (const mode of ['full', 'condensed', 'short'] as PromptMode[]) {
    it(`${mode} stays within budget (95% of 150 prompts)`, () => {
      const settings = defaultSettings();
      settings.mode = mode;
      const [lo, hi] = WORD_BUDGET[mode];
      let ok = 0;
      for (let i = 0; i < 150; i++) {
        const n = wordCount(generatePrompt(i + 1, ctx({ settings })).prompt.promptText);
        if (n >= lo * 0.9 && n <= hi * 1.1) ok++;
      }
      expect(ok / 150).toBeGreaterThanOrEqual(0.95);
    });
  }
  it('character lock is prepended', () => {
    const settings = defaultSettings();
    settings.characterLock = 'MARKER-LOCK-TEXT';
    settings.characterLockEnabled = true;
    expect(generatePrompt(3, ctx({ settings })).prompt.promptText.startsWith('MARKER-LOCK-TEXT')).toBe(true);
  });
});

describe('diversity guard', () => {
  it('avoids recent location+pose combos and hashes', () => {
    const seen = new Set<string>();
    const hashes = new Set<string>();
    for (let i = 0; i < 60; i++) {
      const out = generateUnique(ctx({ recentCombos: seen, existingHashes: hashes }), 30, i + 1000);
      expect(out.repeated).toBe(false);
      const key = `${out.prompt.optionIds.location[0]}+${out.prompt.optionIds.pose[0]}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
      hashes.add(out.prompt.hash);
    }
  });
});

describe('re-roll', () => {
  it('changes only the chosen category', () => {
    const c = ctx();
    const p = generatePrompt(42, c).prompt;
    const next = rerollPromptCategory(p, 'grade', c);
    expect(next).not.toBeNull();
    expect(next!.optionIds.grade).not.toEqual(p.optionIds.grade);
    for (const k of Object.keys(p.optionIds)) if (k !== 'grade') expect(next!.optionIds[k]).toEqual(p.optionIds[k]);
  });
});

describe('style bias', () => {
  const share = (style: 'standard' | 'girlnextdoor', cat: string, tag: string) => {
    const settings = defaultSettings();
    settings.style = style;
    const pools = defaultPools();
    let hit = 0;
    const n = 300;
    for (let i = 0; i < n; i++) {
      const p = generatePrompt(i + 1, ctx({ pools, settings })).prompt;
      const opt = pools.find((x) => x.category === cat)!.options.find((o) => o.id === p.optionIds[cat][0])!;
      if (opt.tags.includes(tag)) hit++;
    }
    return hit / n;
  };
  it('girl-next-door favours phone cameras and natural makeup', () => {
    expect(share('girlnextdoor', 'camera', 'body-phone')).toBeGreaterThan(share('standard', 'camera', 'body-phone') * 1.5);
    expect(share('girlnextdoor', 'makeup', 'natural')).toBeGreaterThan(share('standard', 'makeup', 'natural'));
  });
  it('adds the style anchor line and stays within the word budget', () => {
    const settings = defaultSettings();
    const text = generatePrompt(5, ctx({ settings })).prompt.promptText;
    expect(text).toContain('feel');
    expect(wordCount(text)).toBeLessThanOrEqual(WORD_BUDGET.full[1] * 1.1);
  });
});
