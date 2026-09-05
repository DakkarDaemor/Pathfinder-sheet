import {
  calculateArmorClass,
  calculateCombatManeuvers,
  calculateInitiative,
  calculateSavingThrows,
  type ArmorClassResult,
  type BaseSaves,
  type CombatManeuvers,
  type CreatureCombatProfile,
} from "@/domain/shared/creature";
import { calculateCarryingCapacity, type CarryingCapacity } from "@/domain/shared/encumbrance";
import type { AbilityScores } from "@/domain/shared/abilities";
import type { CompanionBaseDefinition } from "@/content/types";
import { COMPANION_REGISTRY, type CompanionProgression, type MasterCombatSummary } from "./registry";
import type { Companion } from "./types";

export function resolveCompanionAbilityScores(
  base: CompanionBaseDefinition,
  companion: Companion,
  progression: CompanionProgression,
): AbilityScores {
  const withProgression: AbilityScores = {
    ...base.baseAbilityScores,
    str: base.baseAbilityScores.str + progression.abilityAdjustment.str,
    dex: base.baseAbilityScores.dex + progression.abilityAdjustment.dex,
  };
  return { ...withProgression, ...companion.abilityScoreOverrides };
}

export interface CompanionCombatSheet {
  abilityScores: AbilityScores;
  baseAttackBonus: number;
  armorClass: ArmorClassResult;
  savingThrows: BaseSaves;
  initiative: number;
  combatManeuvers: CombatManeuvers;
  carryingCapacity: CarryingCapacity;
}

export function deriveCompanionCombatSheet(
  companion: Companion,
  base: CompanionBaseDefinition,
  masterLevel: number,
  master?: MasterCombatSummary,
): CompanionCombatSheet {
  const progression = COMPANION_REGISTRY[companion.kind].computeProgression(masterLevel, master);
  const abilityScores = resolveCompanionAbilityScores(base, companion, progression);

  const profile: CreatureCombatProfile = {
    size: base.size,
    abilityScores,
    baseAttackBonus: progression.baseAttackBonus,
    baseSaves: progression.baseSaves,
    defense: {
      ...companion.defense,
      naturalArmor: companion.defense.naturalArmor + progression.naturalArmorAdjustment,
    },
  };

  return {
    abilityScores,
    baseAttackBonus: progression.baseAttackBonus,
    armorClass: calculateArmorClass(profile),
    savingThrows: calculateSavingThrows(profile),
    initiative: calculateInitiative(profile),
    combatManeuvers: calculateCombatManeuvers(profile),
    carryingCapacity: calculateCarryingCapacity(abilityScores.str, base.size),
  };
}
