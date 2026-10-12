import type { Option } from './types';

export type StyleId = 'standard' | 'girlnextdoor';

export const STYLE_LABELS: Record<StyleId, string> = {
  standard: 'Standard mix',
  girlnextdoor: 'Girl next door - natural & candid'
};

/** One line added to every prompt so the overall feel is stated explicitly, not just implied by the picks. Shorter in shorter modes. */
export function styleAnchor(style: StyleId | undefined, mode: 'full' | 'condensed' | 'short'): string {
  if (style !== 'girlnextdoor') return '';
  if (mode === 'short') return 'Natural girl-next-door feel, candid and unstyled.';
  if (mode === 'condensed') return 'Girl-next-door feel: relaxed, approachable, an unposed everyday moment, natural skin.';
  return 'Girl-next-door feel: relaxed, approachable and unstyled, an everyday moment caught mid-life rather than a posed shoot, natural skin and hair, nothing overly glamorous or retouched.';
}

/** category -> tag -> weight multiplier. Biases the random pick; it never removes an option or changes compatibility rules. */
const BIAS: Record<StyleId, Record<string, Record<string, number>>> = {
  standard: {},
  girlnextdoor: {
    wardrobe: { cozy: 2.5, athleisure: 1.8, cleangirl: 1.6, boho: 1.5, minimalist: 1.3, streetwear: 1.3, quietluxury: 0.4, oldmoney: 0.5, luxtravel: 0.5, eveningwear: 0.35 },
    makeup: { natural: 3, glam: 0.2, 'eve-makeup': 0.3 },
    camera: { 'body-phone': 3, 'body-cine': 0.15, mf: 0.3, 'cam-disposable': 1.5, 'cam-digicam': 1.5 },
    location: { home: 2, cafe: 1.8, street: 1.3, nightlife: 0.4 },
    pose: { candid: 2.2, 'turned-away': 0.7 },
    expression: { smile: 1.8, laugh: 1.5, serious: 0.5 },
    grade: { clean: 1.3, cinematic: 0.3, moody: 0.4, editorial: 0.3 },
    lighting: { 'window-light': 1.6, soft: 1.2, hard: 0.6 },
    imperfection: { real: 1.4 },
    hair: { natural: 1.5 },
    mood: { cozy: 1.6, quietluxury: 0.4, oldmoney: 0.5 }
  }
};

export function styleMultiplier(style: StyleId | undefined, category: string, option: Option): number {
  const table = BIAS[style ?? 'standard'][category];
  if (!table) return 1;
  let m = 1;
  for (const tag of option.tags) if (table[tag] !== undefined) m *= table[tag];
  return Math.min(8, Math.max(0.05, m));
}
