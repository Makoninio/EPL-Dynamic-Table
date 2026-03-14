export const TOWER_CONFIG = {
  towerHeight: 23,
  rankCount: 20,
  rankSpacing: 1.15,
  radiusFromTower: 8.2,
  badgeScale: 1,
  towerRadius: 2.2,

  glow: {
    top4: 0.85,
    relegation: 0.82,
    mid: 0.45,
    selectedBoost: 0.22,
    hoverBoost: 0.14,
  },

  camera: {
    baseDistance: 16,
    baseHeight: 8,
    orbitAmplitudeX: 1.6,
    orbitAmplitudeZ: 1.2,
    orbitSpeed: 0.11,
    followTopHeightOffset: 2.8,
    selectionDistance: 5.8,
    selectionHeight: 2.4,
  },

  animation: {
    durationSec: 20,
    laneSnapDuration: 0.82,
    overshoot: 0.18,
    momentumFactor: 0.07,
  },
};

export function rankToHeight(rank: number) {
  const clamped = Math.min(TOWER_CONFIG.rankCount, Math.max(1, rank));
  const topIndex = TOWER_CONFIG.rankCount - clamped;
  const baseY = -(TOWER_CONFIG.rankCount - 1) * TOWER_CONFIG.rankSpacing * 0.5;
  return baseY + topIndex * TOWER_CONFIG.rankSpacing;
}

export function zoneColor(rank: number) {
  if (rank <= 4) return '#39d353';
  if (rank >= 18) return '#ff4d4f';
  return '#7c8bb8';
}

export function zoneGlowBase(rank: number) {
  if (rank <= 4) return TOWER_CONFIG.glow.top4;
  if (rank >= 18) return TOWER_CONFIG.glow.relegation;
  return TOWER_CONFIG.glow.mid;
}
