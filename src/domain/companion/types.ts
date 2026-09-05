import type { AbilityScores } from "@/domain/shared/abilities";
import type { DefenseLoadout } from "@/domain/shared/creature";
import type { SizeCategory } from "@/domain/shared/size";
import type { CompanionKind, HitPoints } from "@/domain/character/types";

export type { CompanionKind };

/** Homebrew species stat block, used in place of a content/companions.ts lookup when baseId is null. */
export interface CompanionCustomBase {
  name: string;
  size: SizeCategory;
  baseAbilityScores: AbilityScores;
  naturalAttacks: string;
  speed: number;
  specialQualities: string;
}

export interface Companion {
  id: string;
  schemaVersion: 1;
  kind: CompanionKind;
  baseId: string | null; // reference into content/companions.ts; null for a fully custom base
  customBase: CompanionCustomBase | null; // set only when baseId is null
  name: string;
  masterCharacterId: string;
  abilityScoreOverrides: Partial<AbilityScores>;
  hitPoints: HitPoints;
  defense: DefenseLoadout;
  tricksOrTraits: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}
