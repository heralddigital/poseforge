import type { GeneratedPrompt, Status } from './types';

export type StatusFilter = 'all' | 'unused' | 'generated' | 'posted' | 'rejected' | 'starred';
export type SortKey = 'newest' | 'oldest' | 'starred' | 'status';

export interface HistoryQuery {
  status: StatusFilter;
  search: string;
  category?: string;
  optionId?: string;
  sort: SortKey;
}

export const defaultQuery = (): HistoryQuery => ({ status: 'all', search: '', sort: 'newest' });

const STATUS_RANK: Record<Status, number> = { unused: 0, generated: 1, posted: 2, rejected: 3 };

export function filterHistory(items: GeneratedPrompt[], q: HistoryQuery): GeneratedPrompt[] {
  const needle = q.search.trim().toLowerCase();
  const out = items.filter((p) => {
    if (q.status === 'starred' ? !p.starred : q.status !== 'all' && p.status !== q.status) return false;
    if (q.category && q.optionId && !(p.optionIds[q.category] ?? []).includes(q.optionId)) return false;
    if (needle) {
      const hay = `${p.title}\n${p.promptText}\n${p.notes ?? ''}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
  const byDate = (a: GeneratedPrompt, b: GeneratedPrompt) => b.createdAt.localeCompare(a.createdAt);
  switch (q.sort) {
    case 'oldest': return out.sort((a, b) => -byDate(a, b));
    case 'starred': return out.sort((a, b) => Number(b.starred) - Number(a.starred) || byDate(a, b));
    case 'status': return out.sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || byDate(a, b));
    default: return out.sort(byDate);
  }
}

export interface HistoryStats {
  total: number;
  unused: number;
  generated: number;
  posted: number;
  rejected: number;
  starred: number;
}

export function historyStats(items: GeneratedPrompt[]): HistoryStats {
  const s: HistoryStats = { total: items.length, unused: 0, generated: 0, posted: 0, rejected: 0, starred: 0 };
  for (const p of items) {
    s[p.status] += 1;
    if (p.starred) s.starred += 1;
  }
  return s;
}

/** `used` is derived from status so the two never disagree. */
export const isUsed = (status: Status): boolean => status === 'generated' || status === 'posted';

export function withStatus(p: GeneratedPrompt, status: Status): GeneratedPrompt {
  return { ...p, status, used: isUsed(status) };
}

/** Combos (location+pose) from the most recent N prompts, for the diversity guard. */
export function recentCombos(items: GeneratedPrompt[], window: number): Set<string> {
  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, Math.max(0, window));
  return new Set(sorted.map((p) => `${(p.optionIds.location ?? [])[0] ?? '-'}+${(p.optionIds.pose ?? [])[0] ?? '-'}`));
}

export const allHashes = (items: GeneratedPrompt[]): Set<string> => new Set(items.map((p) => p.hash));

/* ---------- export / import ---------- */

export const EXPORT_VERSION = 1;

export interface ExportFile {
  app: 'poseforge';
  version: number;
  exportedAt: string;
  prompts: GeneratedPrompt[];
}

export function exportJSON(items: GeneratedPrompt[]): string {
  const file: ExportFile = { app: 'poseforge', version: EXPORT_VERSION, exportedAt: new Date().toISOString(), prompts: items };
  return JSON.stringify(file, null, 2);
}

const STATUSES: Status[] = ['unused', 'generated', 'posted', 'rejected'];

export function normalizePrompt(raw: unknown): GeneratedPrompt | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<GeneratedPrompt>;
  if (typeof r.id !== 'string' || typeof r.promptText !== 'string') return null;
  const status: Status = STATUSES.includes(r.status as Status) ? (r.status as Status) : r.used ? 'generated' : 'unused';
  return {
    id: r.id,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date().toISOString(),
    seed: typeof r.seed === 'number' ? r.seed : 0,
    title: typeof r.title === 'string' ? r.title : 'Imported prompt',
    selections: r.selections && typeof r.selections === 'object' ? r.selections : {},
    optionIds: r.optionIds && typeof r.optionIds === 'object' ? r.optionIds : {},
    locked: Array.isArray(r.locked) ? r.locked : [],
    mode: r.mode ?? 'full',
    format: r.format ?? 'paragraph',
    aspect: r.aspect ?? '4:5',
    promptText: r.promptText,
    hash: typeof r.hash === 'string' ? r.hash : '',
    tags: Array.isArray(r.tags) ? r.tags : [],
    used: isUsed(status),
    status,
    starred: !!r.starred,
    notes: r.notes,
    resultRef: r.resultRef,
    config: r.config
  };
}

export interface ImportResult {
  added: GeneratedPrompt[];
  skippedDuplicates: number;
  invalid: number;
}

/** Accepts the app's own export file or a bare array. Duplicates (same id) are skipped. */
export function parseImport(json: string, existing: GeneratedPrompt[]): ImportResult {
  const data = JSON.parse(json) as unknown;
  const list: unknown[] = Array.isArray(data) ? data : Array.isArray((data as ExportFile)?.prompts) ? (data as ExportFile).prompts : [];
  const ids = new Set(existing.map((p) => p.id));
  const res: ImportResult = { added: [], skippedDuplicates: 0, invalid: 0 };
  for (const item of list) {
    const p = normalizePrompt(item);
    if (!p) { res.invalid += 1; continue; }
    if (ids.has(p.id)) { res.skippedDuplicates += 1; continue; }
    ids.add(p.id);
    res.added.push(p);
  }
  return res;
}

const csvCell = (v: string): string => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export function exportCSV(items: GeneratedPrompt[]): string {
  const head = ['id', 'created_at', 'title', 'status', 'starred', 'mode', 'format', 'aspect', 'seed', 'notes', 'prompt'];
  const rows = items.map((p) =>
    [p.id, p.createdAt, p.title, p.status, String(p.starred), p.mode, p.format, p.aspect, String(p.seed), p.notes ?? '', p.promptText].map(csvCell).join(',')
  );
  return [head.join(','), ...rows].join('\r\n');
}
