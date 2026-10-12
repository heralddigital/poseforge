import type { CategoryMeta, Pool } from '@/lib/types';
import { pose, props, expression, hair, wardrobe, accessories, makeup } from './pools-subject';
import { location, background, time, lighting } from './pools-scene';
import { camera, lens, dof, angle, composition, framing, motion } from './pools-camera';
import { grade, mood, imperfection, tech } from './pools-look';

/**
 * Generation order matters: earlier categories populate the context tags that later categories
 * require/exclude against (location -> time -> wardrobe -> camera -> lens -> pose ...).
 */
export const CATEGORIES: CategoryMeta[] = [
  { key: 'location', label: 'Location', picks: [1, 1] },
  { key: 'time', label: 'Time & weather', picks: [1, 1] },
  { key: 'wardrobe', label: 'Wardrobe', picks: [1, 1] },
  { key: 'mood', label: 'Mood', picks: [1, 1] },
  { key: 'camera', label: 'Camera body', picks: [1, 1] },
  { key: 'lens', label: 'Lens', picks: [1, 1] },
  { key: 'pose', label: 'Pose', picks: [1, 1] },
  { key: 'props', label: 'Hands & props', picks: [1, 1] },
  { key: 'expression', label: 'Expression & gaze', picks: [1, 1] },
  { key: 'hair', label: 'Hair', picks: [1, 1] },
  { key: 'accessories', label: 'Accessories', picks: [1, 2] },
  { key: 'makeup', label: 'Makeup & skin', picks: [1, 1] },
  { key: 'background', label: 'Background', picks: [1, 1] },
  { key: 'lighting', label: 'Lighting', picks: [1, 1] },
  { key: 'dof', label: 'Depth of field', picks: [1, 1] },
  { key: 'angle', label: 'Camera angle', picks: [1, 1] },
  { key: 'framing', label: 'Shot type', picks: [1, 1] },
  { key: 'composition', label: 'Composition', picks: [1, 1] },
  { key: 'motion', label: 'Motion & shutter', picks: [1, 1] },
  { key: 'grade', label: 'Color grade', picks: [1, 1] },
  { key: 'imperfection', label: 'Realism details', picks: [1, 3] },
  { key: 'tech', label: 'Quality tail', picks: [1, 1] }
];

const raw: Record<string, Pool['options']> = {
  location, time, mood, wardrobe, camera, lens, pose, props, expression, hair, accessories,
  makeup, background, lighting, dof, angle, framing, composition, motion, grade, imperfection, tech
};

export function defaultPools(): Pool[] {
  return CATEGORIES.map((c) => ({
    category: c.key,
    options: raw[c.key].map((o) => ({ ...o, tags: [...o.tags], requires: o.requires && [...o.requires], excludes: o.excludes && [...o.excludes] }))
  }));
}

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);
export const categoryLabel = (key: string): string => CATEGORIES.find((c) => c.key === key)?.label ?? key;
