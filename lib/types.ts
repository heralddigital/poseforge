export type PromptMode = 'full' | 'condensed' | 'short';
export type PromptFormat = 'paragraph' | 'structured';
export type Status = 'unused' | 'generated' | 'posted' | 'rejected';
export type Pronoun = 'she' | 'he' | 'they';
export type AspectRatio = '9:16' | '4:5' | '1:1' | '3:4';

/**
 * Option text uses "|" to separate detail levels:
 *   Short mode     -> first part only
 *   Condensed mode -> first two parts
 *   Full mode      -> every part
 * Pronoun tokens ({poss}, {subj}, {obj}, {refl}, {is}, {has}) are resolved at generation time.
 */
export interface Option {
  id: string;
  text: string;
  weight: number;
  tags: string[];
  /** Each entry is a tag, or "a|b" meaning at least one of a/b. All entries must be satisfied. */
  requires?: string[];
  /** None of these tags may be present in the rest of the prompt. */
  excludes?: string[];
  enabled: boolean;
}

export interface Pool {
  category: string;
  options: Option[];
}

export interface CategoryMeta {
  key: string;
  label: string;
  /** Inclusive range of options picked for this category. */
  picks: [number, number];
}

export interface Filters {
  setting: string[];
  time: string[];
  season: string[];
  vibe: string[];
  shot: string[];
  cameraLook: string[];
}

export interface Templates {
  paragraph: Record<PromptMode, string[]>;
  structured: Record<PromptMode, string>;
}

export interface Settings {
  style: 'standard' | 'girlnextdoor';
  /** When true every prompt uses the iPhone 18 Pro Max front camera, i.e. a selfie. */
  iphoneSelfieLock: boolean;
  characterLock: string;
  characterLockEnabled: boolean;
  alwaysAppend: string;
  neverInclude: string;
  pronoun: Pronoun;
  mode: PromptMode;
  format: PromptFormat;
  aspect: AspectRatio;
  realism: 1 | 2 | 3 | 4 | 5;
  autoSave: boolean;
  autoMarkUsedOnCopy: boolean;
  enabledCategories: Record<string, boolean>;
  filters: Filters;
  templates: Templates;
  storage: 'local' | 'supabase';
  diversityWindow: number;
}

/** The subset of Settings that influences which options get picked. */
export interface PickConfig {
  style?: 'standard' | 'girlnextdoor';
  filters: Filters;
  enabledCategories: Record<string, boolean>;
  neverInclude: string;
  pronoun: Pronoun;
  realism: number;
  pinned: Record<string, string[]>;
}

export interface GeneratedPrompt {
  id: string;
  createdAt: string;
  seed: number;
  title: string;
  /** category -> resolved option text (multi-pick categories are joined with " || "). */
  selections: Record<string, string>;
  /** category -> option ids actually picked (authoritative record of the pick). */
  optionIds: Record<string, string[]>;
  /** categories that were pinned when this prompt was generated or edited. */
  locked: string[];
  mode: PromptMode;
  format: PromptFormat;
  aspect: AspectRatio;
  promptText: string;
  hash: string;
  tags: string[];
  used: boolean;
  status: Status;
  starred: boolean;
  notes?: string;
  resultRef?: string;
  config?: PickConfig;
}
