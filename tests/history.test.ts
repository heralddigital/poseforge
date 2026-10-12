import { describe, expect, it } from 'vitest';
import { defaultPools } from '@/data/pools';
import { defaultSettings } from '@/lib/defaults';
import { generatePrompt } from '@/lib/generate';
import { defaultQuery, exportCSV, exportJSON, filterHistory, historyStats, parseImport, recentCombos, withStatus } from '@/lib/history';

const make = (n: number) => Array.from({ length: n }, (_, i) => {
  const p = generatePrompt(i + 1, { pools: defaultPools(), settings: defaultSettings(), pinned: {} }).prompt;
  return { ...p, id: `id-${i}`, createdAt: new Date(2026, 0, 1, 0, i).toISOString() };
});

describe('history', () => {
  const items = make(12).map((p, i) => (i % 3 === 0 ? withStatus(p, 'generated') : i % 5 === 0 ? { ...p, starred: true } : p));

  it('filters by status and star', () => {
    const gen = filterHistory(items, { ...defaultQuery(), status: 'generated' });
    expect(gen.every((p) => p.status === 'generated' && p.used)).toBe(true);
    expect(filterHistory(items, { ...defaultQuery(), status: 'starred' }).every((p) => p.starred)).toBe(true);
  });
  it('searches text and notes', () => {
    const withNote = items.map((p, i) => (i === 4 ? { ...p, notes: 'zebra-note' } : p));
    expect(filterHistory(withNote, { ...defaultQuery(), search: 'ZEBRA-note' }).map((p) => p.id)).toEqual(['id-4']);
  });
  it('sorts newest first by default and oldest on request', () => {
    expect(filterHistory(items, defaultQuery())[0].id).toBe('id-11');
    expect(filterHistory(items, { ...defaultQuery(), sort: 'oldest' })[0].id).toBe('id-0');
  });
  it('counts stats', () => {
    const s = historyStats(items);
    expect(s.total).toBe(12);
    expect(s.unused + s.generated + s.posted + s.rejected).toBe(12);
  });
  it('round-trips JSON export/import and skips duplicates', () => {
    const json = exportJSON(items);
    const res = parseImport(json, []);
    expect(res.added).toHaveLength(12);
    expect(res.added[3].promptText).toBe(items[3].promptText);
    expect(parseImport(json, items).skippedDuplicates).toBe(12);
  });
  it('rejects garbage entries but keeps valid ones', () => {
    const res = parseImport(JSON.stringify([{ nope: true }, items[0]]), []);
    expect(res.invalid).toBe(1);
    expect(res.added).toHaveLength(1);
  });
  it('quotes CSV cells correctly', () => {
    const csv = exportCSV([{ ...items[0], title: 'a, "b"', notes: 'line1\nline2' }]);
    expect(csv).toContain('"a, ""b"""');
    expect(csv).toContain('"line1\nline2"');
  });
  it('limits the diversity window', () => {
    expect(recentCombos(items, 3).size).toBeLessThanOrEqual(3);
  });
});
