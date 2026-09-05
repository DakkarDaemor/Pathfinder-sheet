export const SIZE_CATEGORIES = [
  "fine",
  "diminutive",
  "tiny",
  "small",
  "medium",
  "large",
  "huge",
  "gargantuan",
  "colossal",
] as const;

export type SizeCategory = (typeof SIZE_CATEGORIES)[number];

// AC / attack roll size modifier (bigger creatures are easier to hit).
const AC_SIZE_MODIFIER: Record<SizeCategory, number> = {
  fine: 8,
  diminutive: 4,
  tiny: 2,
  small: 1,
  medium: 0,
  large: -1,
  huge: -2,
  gargantuan: -4,
  colossal: -8,
};

// CMB / CMD size modifier is the mirror of the AC one (bigger creatures push/trip harder).
export function sizeModifierAC(size: SizeCategory): number {
  return AC_SIZE_MODIFIER[size];
}

export function sizeModifierCMB(size: SizeCategory): number {
  return -AC_SIZE_MODIFIER[size];
}
