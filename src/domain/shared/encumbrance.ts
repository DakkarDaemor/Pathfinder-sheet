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

export type EncumbranceLevel = "light" | "medium" | "heavy" | "overloaded";

/** Core Rulebook carrying-capacity rule: which band a total carried weight falls into. */
export function resolveEncumbranceLevel(totalWeight: number, capacity: CarryingCapacity): EncumbranceLevel {
  if (totalWeight <= capacity.light) return "light";
  if (totalWeight <= capacity.medium) return "medium";
  if (totalWeight <= capacity.heavy) return "heavy";
  return "overloaded";
}

export interface EncumbrancePenalty {
  maxDexBonus: number | null;
  checkPenalty: number;
}

// Core Rulebook: a medium or heavy load imposes the same max Dex bonus / check penalty as
// wearing medium/heavy armor, regardless of armor actually worn. An overloaded character
// (over their heavy load) is treated the same as heavy for these two penalties; the rulebook's
// separate "can't move" consequence of being overloaded isn't modeled here.
const ENCUMBRANCE_PENALTY: Record<EncumbranceLevel, EncumbrancePenalty> = {
  light: { maxDexBonus: null, checkPenalty: 0 },
  medium: { maxDexBonus: 3, checkPenalty: -3 },
  heavy: { maxDexBonus: 1, checkPenalty: -6 },
  overloaded: { maxDexBonus: 1, checkPenalty: -6 },
};

export function encumbrancePenaltyFor(level: EncumbranceLevel): EncumbrancePenalty {
  return ENCUMBRANCE_PENALTY[level];
}

// Core Rulebook Table: Speed reduction for a medium or heavy load (light load: no reduction).
const ENCUMBERED_SPEED: Record<number, number> = {
  5: 5,
  10: 5,
  15: 10,
  20: 15,
  30: 20,
  40: 30,
  50: 35,
  60: 40,
  70: 50,
  80: 55,
  90: 60,
};

/** Reduced speed while carrying a medium or heavy load; light load (or an unlisted base speed) is unaffected. */
export function encumberedSpeed(baseSpeed: number, level: EncumbranceLevel): number {
  if (level === "light") return baseSpeed;
  return ENCUMBERED_SPEED[baseSpeed] ?? baseSpeed;
}
