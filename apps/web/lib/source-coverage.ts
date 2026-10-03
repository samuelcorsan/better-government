import type { Region, Source } from '@reforma-digital/core';
import regions from './spain-regions.json';

export function sourceCoverage(sources: readonly Source[]) {
  const enabled = sources.filter((source) => source.enabled);
  return {
    national: enabled.filter(
      (source) => source.jurisdictionType === 'country' && source.jurisdictionValue === 'ES',
    ),
    regions: regions.map((region) => ({
      ...region,
      sources: enabled.filter(
        (source) =>
          (source.jurisdictionType === 'region' && source.jurisdictionValue === region.id) ||
          (source.jurisdictionType === 'municipality' &&
            source.jurisdictionValue.startsWith(`${region.id}-`)),
      ),
    })),
  };
}

export function sourceBand(count: number) {
  return count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : 3;
}

export function limitedSourceCoverage(sources: readonly Source[], regionId?: Region | null) {
  return sourceCoverage(sources).regions.find(
    (region) => region.id === regionId && region.sources.length <= 2,
  );
}
