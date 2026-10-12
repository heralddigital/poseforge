import type { PromptMode, Templates } from './types';

/**
 * Template syntax
 *   {pose} {location} ...     category placeholders (see PLACEHOLDERS)
 *   {aspect}                  e.g. "vertical 4:5 frame"
 *   {a+b}                     joins the non-empty values with ", " (paragraph) or "; " (structured)
 *   {Subj} {subj} {poss} {Poss} {obj} {refl} {is} {has}   pronoun tokens
 *   [[ ...{x}... ]]           optional block: dropped entirely if any placeholder inside is empty
 * The Character Lock and "Always append" text are added around the template automatically.
 */
export const PLACEHOLDERS = [
  'pose', 'props', 'expression', 'hair', 'wardrobe', 'accessories', 'makeup', 'location', 'background',
  'time', 'lighting', 'camera', 'lens', 'dof', 'angle', 'framing', 'composition', 'motion', 'grade',
  'mood', 'imperfection', 'tech', 'aspect'
];

export const WORD_BUDGET: Record<PromptMode, [number, number]> = {
  full: [250, 400],
  condensed: [150, 220],
  short: [60, 100]
};

export const DEFAULT_TEMPLATES: Templates = {
  paragraph: {
    full: [
      'Candid lifestyle photograph of {obj} {pose}[[. Expression: {expression}]]. [[Props and hands: {props}. ]]{Subj} {is} wearing {wardrobe}[[, with {accessories}]]. [[Hair: {hair}. ]][[Makeup: {makeup}. ]]The setting is {location}[[, with {background}]], during {time}. Lighting: {lighting}. {camera}, with {lens}. Camera angle: {angle}. Framing: {framing}[[. Depth of field: {dof}]][[. Shutter: {motion}]]. Composition: {composition}, in a {aspect}. Color grade: {grade}[[. Realism details: {imperfection}]]. Mood: {mood}. {tech}.',
      '{Subj} {is} captured in a natural, unposed lifestyle photo, {pose}[[, {expression}]]. Outfit: {wardrobe}[[; accessories: {accessories}]][[; hair: {hair}]][[; makeup: {makeup}]]. [[Held: {props}. ]]Location: {location}[[, {background}]]. Time and weather: {time}. Light: {lighting}. {camera}; lens: {lens}; angle: {angle}; framing: {framing}[[; focus: {dof}]][[; shutter: {motion}]]. Composition: {composition}, {aspect}. Grade: {grade}[[; details: {imperfection}]]. Mood: {mood}. {tech}.',
      "Photographer's brief: a candid social-media photograph of {obj} {pose}[[. Expression: {expression}]]. [[{props}. ]]Styling: {wardrobe}[[, plus {accessories}]]. [[Hair: {hair}. ]][[Makeup: {makeup}. ]]Place and time: {location}[[, {background}]], during {time}. Lighting design: {lighting}. Technical setup: {camera}, with {lens}. Perspective: {angle}, {framing}[[; {dof}]][[; {motion}]]. Composition: {composition}, {aspect}. Finishing: {grade}[[; {imperfection}]]. Mood: {mood}. {tech}.",
      'Natural, unposed lifestyle photograph of {obj} {pose}[[, {expression}]][[. {props}]]. {Subj} {is} dressed in {wardrobe}[[, accessorized with {accessories}]][[. Hair: {hair}]][[. Makeup: {makeup}]]. Location: {location}[[, {background}]]; {time}. Lighting: {lighting}. {camera}, with {lens}; {angle}; {framing}[[; {dof}]][[; {motion}]]. Composition: {composition}, {aspect}. Look: {grade}[[; {imperfection}]]. Mood: {mood}. {tech}.',
      'Unposed influencer-style photograph: {obj} {pose}[[, {expression}]]. [[Props: {props}. ]]{Subj} {is} wearing {wardrobe}[[, with {accessories}]]. [[Hair: {hair}. ]][[Makeup: {makeup}. ]]Shot in {location}[[, {background}]], during {time}. Lighting: {lighting}. Equipment: {camera}, with {lens}. Perspective: {angle}; {framing}[[; {dof}]][[; {motion}]]. Compose it as {composition}, in a {aspect}. Look: {grade}[[, {imperfection}]]. Mood: {mood}. {tech}.'
    ],
    condensed: [
      'Candid lifestyle photo of {obj} {pose}[[, {expression}]]. {Subj} {is} wearing {wardrobe}[[, with {accessories}]][[. Hair: {hair}]]. Setting: {location}, during {time}. Lighting: {lighting}. {camera}, with {lens}; {angle}; {framing}[[; {dof}]]. Composition: {composition}, {aspect}. Grade: {grade}[[, {imperfection}]]. Mood: {mood}. {tech}.',
      'Unposed photo of {obj} {pose}[[, {expression}]]. Outfit: {wardrobe}[[; {accessories}]]. Place: {location}, {time}. Light: {lighting}. {camera}; {lens}; {angle}; {framing}. {composition}, {aspect}. {grade}[[; {imperfection}]]. {tech}.',
      'A natural social-media photograph of {obj} {pose}[[, {expression}]], {Subj} {is} in {wardrobe}[[, {hair}]]. Scene: {location}, {time}. Lighting: {lighting}. {camera}, {lens}, {angle}, {framing}[[, {motion}]]. {composition}, {aspect}. Color: {grade}. Mood: {mood}. {tech}.',
      'Candid photograph, {obj} {pose}[[, {expression}]]. Wearing {wardrobe}[[, {accessories}]]. In {location}, {time}[[, {background}]]. {lighting}. {camera}, {lens}[[; {dof}]]. {framing}, {angle}, {aspect}. {grade}. {mood}. {tech}.'
    ],
    short: [
      'Candid lifestyle photo of {obj} {pose}, wearing {wardrobe}. {location}, {time}. {lighting}. {camera}, {lens}, {framing}, {aspect}. {grade}. {tech}.',
      'Unposed photo: {obj} {pose}[[, {expression}]]. Outfit: {wardrobe}. Place: {location}, {time}. Light: {lighting}. {camera}, {lens}. {framing}, {aspect}. {grade}.',
      '{Subj} {is} {pose}, in {wardrobe}, at {location}, during {time}. {lighting}. {camera}, {lens}, {angle}, {aspect}. {grade}. {tech}.',
      'Natural lifestyle shot of {obj} {pose}. {wardrobe}. {location}[[, {background}]], {time}. {lighting}. {camera}, {lens}, {framing}, {aspect}. {grade}[[, {imperfection}]].'
    ]
  },
  structured: {
    full: [
      'POSE: {pose+expression}',
      'HANDS & PROPS: {props}',
      'WARDROBE: {wardrobe+accessories}',
      'HAIR & MAKEUP: {hair+makeup}',
      'SETTING: {location+background}',
      'TIME & WEATHER: {time}',
      'LIGHTING: {lighting}',
      'CAMERA: {camera}',
      'LENS: {lens+dof}',
      'ANGLE & FRAMING: {angle+framing}',
      'COMPOSITION: {composition+aspect}',
      'MOTION: {motion}',
      'COLOR GRADE: {grade}',
      'MOOD: {mood}',
      'TECH QUALITY: {imperfection+tech}'
    ].join('\n'),
    condensed: [
      'POSE: {pose+expression}',
      'WARDROBE: {wardrobe+accessories}',
      'HAIR & MAKEUP: {hair}',
      'SETTING: {location}',
      'TIME & WEATHER: {time}',
      'LIGHTING: {lighting}',
      'CAMERA: {camera}',
      'LENS: {lens+dof}',
      'ANGLE & FRAMING: {angle+framing}',
      'COMPOSITION: {composition+aspect}',
      'COLOR GRADE: {grade}',
      'MOOD: {mood}',
      'TECH QUALITY: {imperfection+tech}'
    ].join('\n'),
    short: [
      'POSE: {pose}',
      'WARDROBE: {wardrobe}',
      'SETTING: {location}',
      'TIME & WEATHER: {time}',
      'LIGHTING: {lighting}',
      'CAMERA: {camera}',
      'LENS: {lens}',
      'COMPOSITION: {framing+aspect}',
      'COLOR GRADE: {grade}'
    ].join('\n')
  }
};

export function cloneTemplates(t: Templates): Templates {
  return JSON.parse(JSON.stringify(t)) as Templates;
}

/** Placeholder names found in a template that are not recognised (for the Settings editor warning). */
export function unknownPlaceholders(template: string): string[] {
  const known = new Set([...PLACEHOLDERS, 'Subj', 'subj', 'poss', 'Poss', 'obj', 'refl', 'is', 'Is', 'has']);
  const found = new Set<string>();
  for (const m of template.matchAll(/\{([A-Za-z+]+)\}/g)) {
    for (const part of m[1].split('+')) if (part && !known.has(part)) found.add(part);
  }
  return [...found];
}
