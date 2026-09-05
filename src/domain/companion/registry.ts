import { baseAttackBonus, baseSaveBonus } from "@/domain/shared/progressions";
import type { BaseSaves } from "@/domain/shared/creature";
import type { CompanionKind } from "./types";

export interface CompanionProgression {
  baseAttackBonus: number;
  baseSaves: BaseSaves;
  naturalArmorAdjustment: number;
  abilityAdjustment: { str: number; dex: number };
}

export interface MasterCombatSummary {
  baseAttackBonus: number;
  baseSaves: BaseSaves;
}

export interface CompanionKindDefinition {
  kind: CompanionKind;
  labelKey: string;
  /** Master's class level (or paladin/cavalier level for a mount, caster level for a familiar). */
  computeProgression(masterLevel: number, master?: MasterCombatSummary): CompanionProgression;
}

/**
 * Animal Companion / Mount base statistics (Core Rulebook, Open Game Content): natural armor
 * and Str/Dex adjustments grow roughly every 3 and every 4 master levels respectively, on top
 * of a monster-style 3/4 BAB and good Fort/Ref, poor Will progression. The paladin/cavalier
 * mount table is treated as the same progression here as a documented approximation — verify
 * exact numbers against the book if you need tournament-legal precision.
 */
function fullCompanionProgression(masterLevel: number): CompanionProgression {
  return {
    baseAttackBonus: baseAttackBonus("three-quarters", masterLevel),
    baseSaves: {
      fort: baseSaveBonus("good", masterLevel),
      ref: baseSaveBonus("good", masterLevel),
      will: baseSaveBonus("poor", masterLevel),
    },
    naturalArmorAdjustment: Math.floor(masterLevel / 3),
    abilityAdjustment: {
      str: Math.floor((masterLevel - 1) / 4),
      dex: Math.floor((masterLevel - 1) / 4),
    },
  };
}

/**
 * Familiars use their own (very weak) baseline, or the master's numbers where better,
 * per save/BAB (Core Rulebook familiar rules).
 */
function familiarProgression(masterLevel: number, master?: MasterCombatSummary): CompanionProgression {
  const ownBab = baseAttackBonus("half", masterLevel);
  const ownSaves: BaseSaves = {
    fort: baseSaveBonus("poor", masterLevel),
    ref: baseSaveBonus("poor", masterLevel),
    will: baseSaveBonus("good", masterLevel),
  };

  return {
    baseAttackBonus: master ? Math.max(ownBab, master.baseAttackBonus) : ownBab,
    baseSaves: master
      ? {
          fort: Math.max(ownSaves.fort, master.baseSaves.fort),
          ref: Math.max(ownSaves.ref, master.baseSaves.ref),
          will: Math.max(ownSaves.will, master.baseSaves.will),
        }
      : ownSaves,
    naturalArmorAdjustment: 0,
    abilityAdjustment: { str: 0, dex: 0 },
  };
}

export const COMPANION_REGISTRY: Record<CompanionKind, CompanionKindDefinition> = {
  "animal-companion": {
    kind: "animal-companion",
    labelKey: "characterSheet.companions.kindAnimalCompanion",
    computeProgression: fullCompanionProgression,
  },
  mount: {
    kind: "mount",
    labelKey: "characterSheet.companions.kindMount",
    computeProgression: fullCompanionProgression,
  },
  familiar: {
    kind: "familiar",
    labelKey: "characterSheet.companions.kindFamiliar",
    computeProgression: familiarProgression,
  },
};

/**
 * Adding a new companion kind (e.g. eidolon, cohort) means adding one entry here plus any
 * base stat blocks in content/companions.ts — no existing code needs to change (Open/Closed).
 */
export function listCompanionKinds(): CompanionKindDefinition[] {
  return Object.values(COMPANION_REGISTRY);
}
