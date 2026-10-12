import { CATEGORY_KEYS } from '@/data/pools';
import { DEFAULT_TEMPLATES, cloneTemplates } from './templates';
import type { Filters, Settings } from './types';

export const emptyFilters = (): Filters => ({ setting: [], time: [], season: [], vibe: [], shot: [], cameraLook: [] });

export function defaultSettings(): Settings {
  return {
    characterLock: '',
    characterLockEnabled: false,
    alwaysAppend: '',
    neverInclude: '',
    pronoun: 'she',
    mode: 'full',
    format: 'paragraph',
    aspect: '4:5',
    realism: 3,
    autoSave: true,
    autoMarkUsedOnCopy: false,
    enabledCategories: Object.fromEntries(CATEGORY_KEYS.map((k) => [k, true])),
    filters: emptyFilters(),
    templates: cloneTemplates(DEFAULT_TEMPLATES),
    storage: 'local',
    diversityWindow: 50
  };
}

/** Fill any missing keys of a stored Settings object (older versions, partial imports). */
export function mergeSettings(stored: Partial<Settings> | null | undefined): Settings {
  const base = defaultSettings();
  if (!stored) return base;
  return {
    ...base,
    ...stored,
    enabledCategories: { ...base.enabledCategories, ...(stored.enabledCategories ?? {}) },
    filters: { ...base.filters, ...(stored.filters ?? {}) },
    templates: {
      paragraph: { ...base.templates.paragraph, ...(stored.templates?.paragraph ?? {}) },
      structured: { ...base.templates.structured, ...(stored.templates?.structured ?? {}) }
    }
  };
}
