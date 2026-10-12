import type { Pronoun } from './types';

const TABLE: Record<Pronoun, Record<string, string>> = {
  she: { subj: 'she', Subj: 'She', poss: 'her', Poss: 'Her', obj: 'her', refl: 'herself', is: 'is', Is: 'Is', has: 'has' },
  he: { subj: 'he', Subj: 'He', poss: 'his', Poss: 'His', obj: 'him', refl: 'himself', is: 'is', Is: 'Is', has: 'has' },
  they: { subj: 'they', Subj: 'They', poss: 'their', Poss: 'Their', obj: 'them', refl: 'themselves', is: 'are', Is: 'Are', has: 'have' }
};

export const PRONOUN_TOKENS = Object.keys(TABLE.she);

export function pronounToken(pronoun: Pronoun, name: string): string | undefined {
  return TABLE[pronoun][name];
}

/** Replace {poss}, {subj}, {obj}... in an option text. Unknown {tokens} are left untouched. */
export function resolvePronouns(text: string, pronoun: Pronoun): string {
  return text.replace(/\{([A-Za-z]+)\}/g, (m, name: string) => TABLE[pronoun][name] ?? m);
}
