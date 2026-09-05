import type { SizeCategory } from "./size";

// Maximum ("heavy") load in pounds for a Medium creature, indexed by Strength score (1-20).
// Light load = up to 1/3 of this value, medium load = up to 2/3 (Core Rulebook carrying capacity rules).
const HEAVY_LOAD_BY_STR: readonly number[] = [
  0, 3, 6, 10, 13, 16, 20, 23, 26, 30, 33, 38, 43, 50, 58, 66, 76, 86, 100, 116, 133,
];

// Str 20+: every +10 Strength multiplies the heavy load by 4 (official extension rule).
function heavyLoadForMediumCreature(strength: number): number {
  if (strength <= 20) {
    const clamped = Math.max(1, Math.min(20, Math.round(strength)));
    return HEAVY_LOAD_BY_STR[clamped] ?? 0;
  }
  return heavyLoadForMediumCreature(strength - 10) * 4;
}

// Each size step above/below Medium multiplies capacity by 4x (bigger) or 1/4x (smaller).
const SIZE_STEP_FROM_MEDIUM: Record<SizeCategory, number> = {
  fine: -4,
  diminutive: -3,
  tiny: -2,
  small: -1,
  medium: 0,
  large: 1,
  huge: 2,
  gargantuan: 3,
  colossal: 4,
};

export interface CarryingCapacity {
  light: number;
  medium: number;
  heavy: number;
}

export function calculateCarryingCapacity(strength: number, size: SizeCategory = "medium"): CarryingCapacity {
  const sizeSteps = SIZE_STEP_FROM_MEDIUM[size];
  const heavy = heavyLoadForMediumCreature(strength) * 4 ** sizeSteps;
  return {
    light: Math.floor(heavy / 3),
    medium: Math.floor((heavy * 2) / 3),
    heavy: Math.floor(heavy),
  };
}
