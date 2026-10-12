import { createStore, del, delMany, entries, get, set, setMany, clear, type UseStore } from 'idb-keyval';
import type { GeneratedPrompt, Pool, Settings } from '../types';
import type { StorageAdapter } from './types';

/**
 * Browser-local storage via IndexedDB (one key per prompt, so saving one prompt never rewrites the rest).
 * Note: this replaces localStorage on purpose - it has a far larger quota and does not block the main thread.
 */
export class LocalAdapter implements StorageAdapter {
  readonly kind = 'local' as const;
  private prompts: UseStore | null = null;
  private meta: UseStore | null = null;

  private stores(): { prompts: UseStore; meta: UseStore } {
    if (typeof indexedDB === 'undefined') throw new Error('IndexedDB is not available in this environment');
    this.prompts ??= createStore('poseforge-prompts', 'prompts');
    this.meta ??= createStore('poseforge-meta', 'meta');
    return { prompts: this.prompts, meta: this.meta };
  }

  async loadPrompts(): Promise<GeneratedPrompt[]> {
    const rows = await entries<string, GeneratedPrompt>(this.stores().prompts);
    return rows.map(([, v]) => v);
  }
  async savePrompts(items: GeneratedPrompt[]): Promise<void> {
    if (items.length === 0) return;
    await setMany(items.map((p) => [p.id, p] as [string, GeneratedPrompt]), this.stores().prompts);
  }
  async deletePrompts(ids: string[]): Promise<void> {
    if (ids.length) await delMany(ids, this.stores().prompts);
  }
  async clearPrompts(): Promise<void> {
    await clear(this.stores().prompts);
  }
  async loadSettings(): Promise<Partial<Settings> | null> {
    return (await get<Partial<Settings>>('settings', this.stores().meta)) ?? null;
  }
  async saveSettings(settings: Settings): Promise<void> {
    await set('settings', settings, this.stores().meta);
  }
  async loadPools(): Promise<Pool[] | null> {
    return (await get<Pool[]>('pools', this.stores().meta)) ?? null;
  }
  async savePools(pools: Pool[]): Promise<void> {
    await set('pools', pools, this.stores().meta);
  }
  async removeKey(key: string): Promise<void> {
    await del(key, this.stores().meta);
  }
}
