export type BabProgression = "full" | "three-quarters" | "half";

export function baseAttackBonus(progression: BabProgression, level: number): number {
  if (level <= 0) return 0;
  switch (progression) {
    case "full":
      return level;
    case "three-quarters":
      return Math.floor((level * 3) / 4);
    case "half":
      return Math.floor(level / 2);
  }
}

export type SaveProgression = "good" | "poor";

export function baseSaveBonus(progression: SaveProgression, level: number): number {
  if (level <= 0) return 0;
  return progression === "good" ? 2 + Math.floor(level / 2) : Math.floor(level / 3);
}
