import type { GeneratedPrompt, Pool, Settings } from '../types';
import type { StorageAdapter } from './types';

/**
 * Supabase via PostgREST over plain fetch (no SDK dependency).
 * Tables are defined in docs/supabase.sql. Row-level security is the caller's responsibility -
 * see the README: with the anon key and permissive policies anyone with the URL+key can read/write.
 * NOT tested against a live project in this build.
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  /** Row owner / workspace label (single-user default). */
  owner?: string;
}

interface PromptRow {
  id: string;
  owner: string;
  created_at: string;
  status: string;
  starred: boolean;
  payload: GeneratedPrompt;
}

export class SupabaseAdapter implements StorageAdapter {
  readonly kind = 'supabase' as const;
  private readonly base: string;
  private readonly owner: string;

  constructor(private readonly cfg: SupabaseConfig) {
    this.base = `${cfg.url.replace(/\/+$/, '')}/rest/v1`;
    this.owner = cfg.owner ?? 'default';
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    return { apikey: this.cfg.anonKey, Authorization: `Bearer ${this.cfg.anonKey}`, 'Content-Type': 'application/json', ...extra };
  }

  private async req(path: string, init: RequestInit = {}): Promise<Response> {
    const res = await fetch(`${this.base}/${path}`, { ...init, headers: this.headers(init.headers as Record<string, string>) });
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return res;
  }

  async loadPrompts(): Promise<GeneratedPrompt[]> {
    const out: GeneratedPrompt[] = [];
    const page = 1000;
    for (let from = 0; ; from += page) {
      const res = await this.req(`prompts?owner=eq.${encodeURIComponent(this.owner)}&select=payload&order=created_at.desc`, {
        headers: { Range: `${from}-${from + page - 1}`, 'Range-Unit': 'items' }
      });
      const rows = (await res.json()) as Pick<PromptRow, 'payload'>[];
      out.push(...rows.map((r) => r.payload));
      if (rows.length < page) break;
    }
    return out;
  }
  async savePrompts(items: GeneratedPrompt[]): Promise<void> {
    if (!items.length) return;
    const rows: PromptRow[] = items.map((p) => ({ id: p.id, owner: this.owner, created_at: p.createdAt, status: p.status, starred: p.starred, payload: p }));
    await this.req('prompts?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) });
  }
  async deletePrompts(ids: string[]): Promise<void> {
    if (!ids.length) return;
    const list = ids.map((i) => `"${i.replace(/"/g, '')}"`).join(',');
    await this.req(`prompts?owner=eq.${encodeURIComponent(this.owner)}&id=in.(${encodeURIComponent(list)})`, { method: 'DELETE' });
  }
  async clearPrompts(): Promise<void> {
    await this.req(`prompts?owner=eq.${encodeURIComponent(this.owner)}`, { method: 'DELETE' });
  }

  private async getDoc<T>(kind: string): Promise<T | null> {
    const res = await this.req(`app_state?owner=eq.${encodeURIComponent(this.owner)}&kind=eq.${kind}&select=payload`);
    const rows = (await res.json()) as { payload: T }[];
    return rows[0]?.payload ?? null;
  }
  private async putDoc(kind: string, payload: unknown): Promise<void> {
    await this.req('app_state?on_conflict=owner,kind', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify([{ owner: this.owner, kind, payload, updated_at: new Date().toISOString() }])
    });
  }
  loadSettings(): Promise<Partial<Settings> | null> { return this.getDoc<Partial<Settings>>('settings'); }
  saveSettings(settings: Settings): Promise<void> { return this.putDoc('settings', settings); }
  loadPools(): Promise<Pool[] | null> { return this.getDoc<Pool[]>('pools'); }
  savePools(pools: Pool[]): Promise<void> { return this.putDoc('pools', pools); }
}
