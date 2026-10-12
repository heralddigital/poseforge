import type { Option } from '@/lib/types';

/**
 * Compact authoring format for option pools.
 *   t = text ("|" separates detail levels), g = tags, r = requires, x = excludes, w = weight
 * g / r / x are space-separated. In r, "a|b" means "a OR b"; separate tokens are ANDed.
 */
export interface Seed {
  t: string;
  g: string;
  r: string;
  x: string;
  w: number;
}

export const s = (t: string, g = '', r = '', x = '', w = 1): Seed => ({ t, g, r, x, w });

const split = (v: string): string[] => v.split(/\s+/).filter(Boolean);

export function build(category: string, seeds: Seed[]): Option[] {
  return seeds.map((seed, i) => {
    const option: Option = {
      id: `${category}-${String(i + 1).padStart(3, '0')}`,
      text: seed.t,
      weight: seed.w,
      tags: split(seed.g),
      enabled: true
    };
    const requires = split(seed.r);
    const excludes = split(seed.x);
    if (requires.length) option.requires = requires;
    if (excludes.length) option.excludes = excludes;
    return option;
  });
}
