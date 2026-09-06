export const ABILITY_NAMES = ["str", "dex", "con", "int", "wis", "cha"] as const;

export type AbilityName = (typeof ABILITY_NAMES)[number];

export type AbilityScores = Record<AbilityName, number>;

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function createDefaultAbilityScores(base = 10): AbilityScores {
  return { str: base, dex: base, con: base, int: base, wis: base, cha: base };
}
