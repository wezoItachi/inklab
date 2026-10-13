import type { LoadoutSlot } from './loadouts.ts';

export const COMMUNITY_SAMPLE_THRESHOLDS = {
  preview: 20,
  common: 50,
  stable: 100,
} as const;

export type CommunitySampleLevel = 'insufficient' | 'preview' | 'common' | 'stable';

export type CommunityTemplate = {
  id: string;
  title: string;
  uniquePlayerCount: number;
  sampleCount: number;
  slots: readonly LoadoutSlot[];
};

export type CommunitySampleSummary = {
  weaponId: string;
  uniquePlayerCount: number;
  sampleCount: number;
  level: CommunitySampleLevel;
  templates: readonly CommunityTemplate[];
};

export function classifyCommunitySampleLevel(uniquePlayerCount: number): CommunitySampleLevel {
  if (uniquePlayerCount >= COMMUNITY_SAMPLE_THRESHOLDS.stable) return 'stable';
  if (uniquePlayerCount >= COMMUNITY_SAMPLE_THRESHOLDS.common) return 'common';
  if (uniquePlayerCount >= COMMUNITY_SAMPLE_THRESHOLDS.preview) return 'preview';
  return 'insufficient';
}

/**
 * Placeholder boundary for the future reviewed community dataset.
 * Do not populate this from external sites without recording permission and provenance.
 */
const communitySampleCatalog: readonly CommunitySampleSummary[] = [];

export function getCommunitySampleSummary(weaponId: string): CommunitySampleSummary {
  return communitySampleCatalog.find((entry) => entry.weaponId === weaponId) ?? {
    weaponId,
    uniquePlayerCount: 0,
    sampleCount: 0,
    level: 'insufficient',
    templates: [],
  };
}
