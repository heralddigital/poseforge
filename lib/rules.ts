/**
 * Compatibility rules, kept separate from the data so they are easy to edit.
 *
 * The engine keeps a "context" set of tags: every tag of every option picked so far (plus tags injected
 * by the season/weather filters). An option is eligible when:
 *   1. every entry of option.requires is satisfied by the context ("a|b" = either tag),
 *   2. none of option.excludes is in the context,
 *   3. no CONFLICTS pair is violated, and
 *   4. no RULE forbids it (or fails to provide a needed tag) given the context.
 */

export interface Rule {
  id: string;
  /** Rule is active when ALL of these tags are in the context. */
  when: string[];
  /** ...and none of these tags are in the context. */
  unless?: string[];
  /** Limit the rule to one category (omit = every category). */
  category?: string;
  /** Options carrying any of these tags are rejected. */
  forbid?: string[];
  /** Options must carry at least one of these tags. */
  needAny?: string[];
  /** Options carrying any of these tags are exempt from this rule. */
  exempt?: string[];
}

/** Tag pairs that can never appear together (checked in both directions, across categories). */
export const CONFLICTS: Array<[string, string]> = [
  ['winter', 'summer'],
  ['winter', 'beach'],
  ['snow', 'summer'],
  ['snow', 'beach'],
  ['cold', 'summer'],
  ['cold', 'beach'],
  ['night-only', 'day'],
  ['night-only', 'golden'],
  ['night-strict', 'blue'],
  ['rain', 'sunny'],
  ['overcast', 'sunny'],
  ['midday', 'night'],
  // duplicate wearables between props, accessories and hair
  ['bag', 'bag'],
  ['glasses', 'glasses'],
  ['hat', 'hat'],
  ['audio', 'audio'],
  ['cap', 'hat'],
  ['beanie', 'hat'],
  ['scarf', 'scarf'],
  ['clip', 'hairacc'],
  ['cap', 'hairacc'],
  ['beanie', 'hairacc'],
  ['hairacc', 'hairacc']
];

export const RULES: Rule[] = [
  { id: 'busy-hands-no-props', when: ['hands-busy'], category: 'props', needAny: ['busy-ok'] },
  { id: 'indoor-no-wind', when: ['indoor'], unless: ['airflow'], forbid: ['wind'] },
  { id: 'mirror-needs-phone-prop', when: ['mirror-selfie'], category: 'props', needAny: ['phone-in-hand'] },
  { id: 'mirror-needs-mirror-angle', when: ['mirror-selfie'], category: 'angle', needAny: ['mirror-angle'] },
  { id: 'selfie-cam-angle', when: ['selfie-cam'], unless: ['mirror-selfie'], category: 'angle', needAny: ['selfie'] },
  { id: 'selfie-cam-no-full', when: ['selfie-cam'], unless: ['mirror-selfie'], category: 'framing', forbid: ['full', 'threeq', 'detail'] },
  { id: 'iphone-selfie-no-mirror', when: ['iphone18'], category: 'pose', forbid: ['mirror-selfie'] },
  { id: 'selfie-needs-selfie-pose', when: ['selfie-cam'], category: 'pose', needAny: ['selfie-pose'], exempt: ['mirror-selfie'] },
  { id: 'selfie-needs-selfie-props', when: ['selfie-cam'], unless: ['mirror-selfie'], category: 'props', needAny: ['selfie-hand'] },
  { id: 'selfie-cam-pose', when: ['selfie-cam'], category: 'pose', forbid: ['needs-full', 'walking', 'motion', 'hands-busy', 'lying'], exempt: ['mirror-selfie'] },
  { id: 'phone-no-optical-bokeh', when: ['body-phone'], category: 'dof', forbid: ['optical-shallow', 'mf-dof', 'tele-dof'] },
  { id: 'gym-wardrobe', when: ['gym'], category: 'wardrobe', needAny: ['gymwear', 'athleisure', 'gymcore'] },
  { id: 'swim-wardrobe', when: ['swim'], category: 'wardrobe', needAny: ['beach'] },
  { id: 'winter-wardrobe', when: ['winter'], category: 'wardrobe', needAny: ['winter'] },
  { id: 'cold-wardrobe', when: ['cold'], category: 'wardrobe', needAny: ['winter'] },
  { id: 'snow-wardrobe', when: ['snow'], category: 'wardrobe', needAny: ['winter'] },
  { id: 'nightlife-wardrobe', when: ['nightlife'], category: 'wardrobe', needAny: ['eveningwear', 'streetwear', 'y2k'] },
  { id: 'polaroid-grade', when: ['cam-polaroid'], category: 'grade', needAny: ['instant'] },
  { id: 'disposable-grade', when: ['cam-disposable'], category: 'grade', needAny: ['disposable'] },
  { id: 'digicam-grade', when: ['cam-digicam'], category: 'grade', needAny: ['digicam'] },
  { id: 'night-no-sun-light', when: ['night'], category: 'lighting', forbid: ['sun'] }
];
