import type { BaseSaves } from "@/domain/shared/creature";
import type { RaceDefinition } from "@/content/types";
import type { PlayerCharacter } from "./types";

export type RaceLookup = Record<string, RaceDefinition | undefined>;

export interface RaceBonuses {
  savingThrows: Partial<BaseSaves>;
  skillBonuses: Record<string, number>;
  extraSkillPointsPerLevel: number;
  bonusFeatSlots: number;
}

function emptyRaceBonuses(): RaceBonuses {
  return { savingThrows: {}, skillBonuses: {}, extraSkillPointsPerLevel: 0, bonusFeatSlots: 0 };
}

/**
 * Folds every racial trait with a structured `effects` list into a flat set of bonuses the
 * rest of the calculations can add in — mirrors `resolveFeatBonuses`. Only unconditional
 * traits (e.g. Keen Senses) carry `effects`; conditional ones (e.g. Dwarf Hardy) have none and
 * stay purely descriptive, so they contribute nothing here.
 */
export function resolveRaceBonuses(character: PlayerCharacter, racesById: RaceLookup): RaceBonuses {
  const bonuses = emptyRaceBonuses();
  const race = racesById[character.raceId];
  if (!race) return bonuses;

  for (const trait of race.traits) {
    for (const effect of trait.effects ?? []) {
      switch (effect.kind) {
        case "skillBonus":
          bonuses.skillBonuses[effect.skillId] =
            (bonuses.skillBonuses[effect.skillId] ?? 0) + effect.bonus;
          break;
        case "skillFocusChoice":
          if (character.floatingSkillChoice) {
            bonuses.skillBonuses[character.floatingSkillChoice] =
              (bonuses.skillBonuses[character.floatingSkillChoice] ?? 0) + effect.bonus;
          }
          break;
        case "savingThrowAll":
          bonuses.savingThrows.fort = (bonuses.savingThrows.fort ?? 0) + effect.bonus;
          bonuses.savingThrows.ref = (bonuses.savingThrows.ref ?? 0) + effect.bonus;
          bonuses.savingThrows.will = (bonuses.savingThrows.will ?? 0) + effect.bonus;
          break;
        case "extraSkillPointPerLevel":
          bonuses.extraSkillPointsPerLevel += effect.bonus;
          break;
        case "bonusFeatSlot":
          bonuses.bonusFeatSlots += effect.count;
          break;
      }
    }
  }

  return bonuses;
}
