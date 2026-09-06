import type { AbilityName, AbilityScores } from "@/domain/shared/abilities";
import type { DefenseLoadout } from "@/domain/shared/creature";
import type { SizeCategory } from "@/domain/shared/size";
import type { ArmorCategory, FeatType } from "@/content/types";

export interface CharacterClassLevel {
  classId: string;
  level: number;
  // Per-level hit-die override (index i = this class entry's level i+1), e.g. from a real dice
  // roll instead of the "take average" default. null/absent at an index = use the default (max
  // on the character's very first level ever, average — see averageHitDie — after that).
  hpRolls?: (number | null)[];
}

export interface SkillRank {
  skillId: string;
  ranks: number;
  classSkillOverride?: boolean; // for class skills granted outside the class's own list (race, trait, feat)
  miscModifier: number;
}

export interface FeatSlot {
  id: string;
  featId: string | null; // reference into content/feats.ts; null for a fully custom feat
  customName: string;
  customDescription: string;
  customType: FeatType; // only meaningful when featId is null; lets custom feats count toward type-gated bonus feats
  selectedSkillId: string | null; // only meaningful for a feat whose effect is "skillFocus" (the chosen skill)
  selectedWeaponId: string | null; // only meaningful for a feat whose effect is "weaponAttackBonus" (reference into content/equipment.ts)
  notes: string;
}

/** Structured homebrew weapon stats, mirroring WeaponDefinition; only meaningful when equipmentId is null. */
export interface CustomWeaponStats {
  damage: string; // dice expression, e.g. "1d8"
  critRange: string; // e.g. "19-20" or "20"
  critMultiplier: number;
  damageTypes: string; // free text (not i18n-mapped, unlike the catalog's damageTypes keys), e.g. "slashing, fire"
}

/**
 * Structured homebrew armor/shield stats, mirroring ArmorDefinition; only meaningful when
 * equipmentId is null. `checkPenalty` follows ArmorDefinition's convention (zero or negative).
 */
export interface CustomArmorStats {
  category: ArmorCategory;
  acBonus: number;
  maxDexBonus: number | null;
  checkPenalty: number;
}

export interface InventoryItem {
  id: string;
  equipmentId: string | null; // reference into content/equipment.ts; null for a fully custom item
  name: string;
  quantity: number;
  weight: number;
  equipped: boolean;
  customQualities: string; // only meaningful when equipmentId is null: flavor text/special abilities
  customWeapon: CustomWeaponStats | null; // set to give a custom item an attack entry, same as a catalog weapon
  customArmor: CustomArmorStats | null; // set to give a custom item an AC contribution, same as catalog armor
  notes: string;
}

export interface KnownSpell {
  id: string;
  spellId: string | null; // reference into content/spells.ts; null for a fully custom spell
  customName: string;
  customDescription: string;
  customSchool: string; // only meaningful when spellId is null
  customLevel: number; // only meaningful when spellId is null
  customSpellcastingClassId: string | null; // only meaningful when spellId is null; picks which known class's ability/table computes its DC and slot
  prepared: boolean;
}

export interface HitPoints {
  max: number;
  current: number;
  nonLethal: number;
  autoMax: boolean; // when true, `max` is computed from class hit dice + Con instead of read directly
}

export type CompanionKind = "animal-companion" | "familiar" | "mount";

export interface CharacterCompanionLink {
  companionId: string;
  kind: CompanionKind;
}

export interface PlayerCharacter {
  id: string;
  schemaVersion: 1;
  name: string;
  playerName: string;
  raceId: string;
  alignment: string;
  deity: string;
  size: SizeCategory;
  classLevels: CharacterClassLevel[];
  abilityScores: AbilityScores; // base scores, before racial adjustments — see deriveEffectiveAbilityScores
  floatingAbilityChoice: AbilityName | null; // which ability gets the race's floatingAbilityBonus, if any
  floatingSkillChoice: string | null; // which skill gets a race trait's skillFocusChoice bonus (e.g. Gnome Obsessive), if any
  hitPoints: HitPoints;
  defense: DefenseLoadout;
  skills: SkillRank[];
  feats: FeatSlot[];
  traits: string[];
  inventory: InventoryItem[];
  spells: KnownSpell[];
  companions: CharacterCompanionLink[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export function totalCharacterLevel(character: Pick<PlayerCharacter, "classLevels">): number {
  return character.classLevels.reduce((sum, cl) => sum + cl.level, 0);
}
