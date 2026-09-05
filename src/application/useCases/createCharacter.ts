import { createDefaultAbilityScores } from "@/domain/shared/abilities";
import { createDefaultDefenseLoadout } from "@/domain/shared/creature";
import type { PlayerCharacter } from "@/domain/character/types";
import { SKILLS } from "@/content/skills";
import { generateId } from "@/shared/id";

export function createNewCharacter(name: string): PlayerCharacter {
  const now = new Date().toISOString();

  return {
    id: generateId(),
    schemaVersion: 1,
    name,
    playerName: "",
    raceId: "human",
    alignment: "",
    deity: "",
    size: "medium",
    classLevels: [],
    abilityScores: createDefaultAbilityScores(10),
    hitPoints: { max: 0, current: 0, nonLethal: 0 },
    defense: createDefaultDefenseLoadout(),
    skills: SKILLS.map((skill) => ({ skillId: skill.id, ranks: 0, miscModifier: 0 })),
    feats: [],
    traits: [],
    inventory: [],
    spells: [],
    companions: [],
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}
