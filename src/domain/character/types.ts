import type { AbilityScores } from "@/domain/shared/abilities";
import type { DefenseLoadout } from "@/domain/shared/creature";
import type { SizeCategory } from "@/domain/shared/size";
import type { FeatType } from "@/content/types";

export interface CharacterClassLevel {
  classId: string;
  level: number;
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
  notes: string;
}

export interface InventoryItem {
  id: string;
  equipmentId: string | null; // reference into content/equipment.ts; null for a fully custom item
  name: string;
  quantity: number;
  weight: number;
  equipped: boolean;
  notes: string;
}

export interface KnownSpell {
  id: string;
  spellId: string | null; // reference into content/spells.ts; null for a fully custom spell
  customName: string;
  customDescription: string;
  customSchool: string; // only meaningful when spellId is null
  customLevel: number; // only meaningful when spellId is null; enables future spell-slot tracking
  prepared: boolean;
}

export interface HitPoints {
  max: number;
  current: number;
  nonLethal: number;
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
  abilityScores: AbilityScores;
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
