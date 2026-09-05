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
import type { SizeCategory } from "@/domain/shared/size";
import { COMPANION_BASES_BY_ID } from "@/content/companions";
import { COMPANION_REGISTRY, type CompanionProgression, type MasterCombatSummary } from "./registry";
import type { Companion } from "./types";

export interface CompanionBaseStats {
  size: SizeCategory;
  baseAbilityScores: AbilityScores;
}

/** Resolves species stats from the built-in catalog (baseId) or the companion's own custom base. */
export function resolveCompanionBaseStats(companion: Companion): CompanionBaseStats | null {
  if (companion.baseId) {
    const base = COMPANION_BASES_BY_ID[companion.baseId];
    return base ? { size: base.size, baseAbilityScores: base.baseAbilityScores } : null;
  }
  if (companion.customBase) {
    return { size: companion.customBase.size, baseAbilityScores: companion.customBase.baseAbilityScores };
  }
  return null;
}

export function resolveCompanionAbilityScores(
  base: CompanionBaseStats,
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
  masterLevel: number,
  master?: MasterCombatSummary,
): CompanionCombatSheet | null {
  const base = resolveCompanionBaseStats(companion);
  if (!base) return null;

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
