import { createDefaultDefenseLoadout } from "@/domain/shared/creature";
import type { Companion, CompanionKind } from "@/domain/companion/types";
import { generateId } from "@/shared/id";

export function createNewCompanion(
  kind: CompanionKind,
  baseId: string,
  masterCharacterId: string,
  name: string,
): Companion {
  const now = new Date().toISOString();

  return {
    id: generateId(),
    schemaVersion: 1,
    kind,
    baseId,
    customBase: null,
    name,
    masterCharacterId,
    abilityScoreOverrides: {},
    hitPoints: { max: 0, current: 0, nonLethal: 0 },
    defense: createDefaultDefenseLoadout(),
    tricksOrTraits: [],
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}
