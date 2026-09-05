import type { AbilityScores } from "@/domain/shared/abilities";
import type { DefenseLoadout } from "@/domain/shared/creature";
import type { CompanionKind, HitPoints } from "@/domain/character/types";

export type { CompanionKind };

export interface Companion {
  id: string;
  schemaVersion: 1;
  kind: CompanionKind;
  baseId: string; // reference into content/companions.ts
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
