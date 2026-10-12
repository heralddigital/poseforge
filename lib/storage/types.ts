import type { GeneratedPrompt, Pool, Settings } from '../types';

/** Everything the app persists. Implementations must be safe to call repeatedly. */
export interface StorageAdapter {
  readonly kind: 'local' | 'supabase';
  loadPrompts(): Promise<GeneratedPrompt[]>;
  savePrompts(items: GeneratedPrompt[]): Promise<void>;
  deletePrompts(ids: string[]): Promise<void>;
  clearPrompts(): Promise<void>;
  loadSettings(): Promise<Partial<Settings> | null>;
  saveSettings(settings: Settings): Promise<void>;
  loadPools(): Promise<Pool[] | null>;
  savePools(pools: Pool[]): Promise<void>;
}
