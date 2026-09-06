import type { AbilityName, AbilityScores } from "@/domain/shared/abilities";
import type { BabProgression, SaveProgression } from "@/domain/shared/progressions";
import type { SizeCategory } from "@/domain/shared/size";
import type { CompanionKind } from "@/domain/character/types";

/**
 * Every reference-content entry stores i18n *keys* (namespace "srd"), never literal
 * display strings, so IT/EN stay in sync with the data instead of hardcoded text.
 */

export interface RaceDefinition {
  id: string;
  nameKey: string;
  size: SizeCategory;
  speed: number;
  abilityAdjustments: Partial<AbilityScores>;
  floatingAbilityBonus?: number; // e.g. Human/Half-Elf/Half-Orc: player picks one ability for +N
  traitKeys: string[]; // short descriptive racial traits (darkvision, etc.)
}

export interface ClassFeature {
  level: number;
  nameKey: string;
}

export interface ClassDefinition {
  id: string;
  nameKey: string;
  hitDie: number;
  babProgression: BabProgression;
  saveProgressions: { fort: SaveProgression; ref: SaveProgression; will: SaveProgression };
  skillPointsPerLevel: number;
  classSkillIds: string[];
  isSpellcaster: boolean;
  spellcastingAbility?: AbilityName;
  features: ClassFeature[];
}

export interface SkillDefinition {
  id: string;
  nameKey: string;
  keyAbility: AbilityName;
  trainedOnly: boolean;
  armorCheckPenalty: boolean;
}

export const FEAT_TYPES = ["combat", "general", "item-creation", "metamagic", "other"] as const;
export type FeatType = (typeof FEAT_TYPES)[number];

/**
 * A structured, automatically-applied numeric effect for the handful of feats whose benefit is
 * a flat, unconditional bonus — most feats (situational, or requiring GM/player judgment) have
 * no `effect` and stay purely descriptive, same as before. `skillFocus` and `weaponAttackBonus`
 * each need the player to pick a target (skill / weapon) — see `FeatSlot.selectedSkillId` and
 * `FeatSlot.selectedWeaponId`.
 */
export type FeatEffect =
  | { kind: "savingThrow"; save: "fort" | "ref" | "will"; bonus: number }
  | { kind: "initiative"; bonus: number }
  | { kind: "dodgeAc"; bonus: number }
  | { kind: "hitPoints" } // Toughness: +3 hp, or (HD count) hp once HD > 3
  | { kind: "skillFocus"; bonus: number; bonusAtTenRanks: number }
  | { kind: "weaponAttackBonus"; bonus: number };

export interface FeatDefinition {
  id: string;
  nameKey: string;
  descriptionKey: string;
  prerequisiteKey: string | null;
  type: FeatType;
  effect?: FeatEffect;
}

export interface SpellDefinition {
  id: string;
  nameKey: string;
  descriptionKey: string;
  school: string;
  levelsByClass: Record<string, number>;
}

export type WeaponCategory = "simple" | "martial" | "exotic";

export interface WeaponDefinition {
  id: string;
  nameKey: string;
  category: WeaponCategory;
  damage: string;
  critRange: string;
  critMultiplier: number;
  damageTypes: string[];
  weight: number;
  costGp: number;
}

export type ArmorCategory = "light" | "medium" | "heavy" | "shield";

export interface ArmorDefinition {
  id: string;
  nameKey: string;
  category: ArmorCategory;
  acBonus: number;
  maxDexBonus: number | null;
  checkPenalty: number;
  spellFailurePercent: number;
  weight: number;
  costGp: number;
}

export interface GearDefinition {
  id: string;
  nameKey: string;
  weight: number;
  costGp: number;
}

export interface CompanionBaseDefinition {
  id: string;
  kind: CompanionKind;
  nameKey: string;
  size: SizeCategory;
  baseAbilityScores: AbilityScores;
  naturalAttacksKey: string;
  speed: number;
  specialQualitiesKey: string | null;
}
