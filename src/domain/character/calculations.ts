import { abilityModifier } from "@/domain/shared/abilities";
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
import { baseAttackBonus, baseSaveBonus } from "@/domain/shared/progressions";
import type { ClassDefinition, SkillDefinition } from "@/content/types";
import type { PlayerCharacter } from "./types";

export type ClassLookup = Record<string, ClassDefinition | undefined>;
export type SkillLookup = Record<string, SkillDefinition | undefined>;

/** Multiclass rule: BAB is each class's own progression, summed together. */
export function resolveBaseAttackBonus(character: PlayerCharacter, classesById: ClassLookup): number {
  return character.classLevels.reduce((sum, cl) => {
    const def = classesById[cl.classId];
    return def ? sum + baseAttackBonus(def.babProgression, cl.level) : sum;
  }, 0);
}

/** Multiclass rule: each class contributes its own base save bonus; these are summed. */
export function resolveBaseSaves(character: PlayerCharacter, classesById: ClassLookup): BaseSaves {
  return character.classLevels.reduce<BaseSaves>(
    (acc, cl) => {
      const def = classesById[cl.classId];
      if (!def) return acc;
      return {
        fort: acc.fort + baseSaveBonus(def.saveProgressions.fort, cl.level),
        ref: acc.ref + baseSaveBonus(def.saveProgressions.ref, cl.level),
        will: acc.will + baseSaveBonus(def.saveProgressions.will, cl.level),
      };
    },
    { fort: 0, ref: 0, will: 0 },
  );
}

export interface CharacterCombatSheet {
  baseAttackBonus: number;
  armorClass: ArmorClassResult;
  savingThrows: BaseSaves;
  initiative: number;
  combatManeuvers: CombatManeuvers;
  carryingCapacity: CarryingCapacity;
}

export function deriveCombatSheet(character: PlayerCharacter, classesById: ClassLookup): CharacterCombatSheet {
  const bab = resolveBaseAttackBonus(character, classesById);
  const baseSaves = resolveBaseSaves(character, classesById);
  const profile: CreatureCombatProfile = {
    size: character.size,
    abilityScores: character.abilityScores,
    baseAttackBonus: bab,
    baseSaves,
    defense: character.defense,
  };

  return {
    baseAttackBonus: bab,
    armorClass: calculateArmorClass(profile),
    savingThrows: calculateSavingThrows(profile),
    initiative: calculateInitiative(profile),
    combatManeuvers: calculateCombatManeuvers(profile),
    carryingCapacity: calculateCarryingCapacity(character.abilityScores.str, character.size),
  };
}

export interface SkillTotal {
  skillId: string;
  ranks: number;
  total: number;
  isClassSkill: boolean;
}

function isClassSkillFor(skillId: string, character: PlayerCharacter, classesById: ClassLookup): boolean {
  const override = character.skills.find((s) => s.skillId === skillId)?.classSkillOverride;
  if (override !== undefined) return override;
  return character.classLevels.some((cl) => classesById[cl.classId]?.classSkillIds.includes(skillId) ?? false);
}

export function deriveSkillTotals(
  character: PlayerCharacter,
  classesById: ClassLookup,
  skillsById: SkillLookup,
): SkillTotal[] {
  return character.skills.map((rank) => {
    const def = skillsById[rank.skillId];
    if (!def) {
      return { skillId: rank.skillId, ranks: rank.ranks, total: rank.ranks + rank.miscModifier, isClassSkill: false };
    }

    const isClassSkill = isClassSkillFor(rank.skillId, character, classesById);
    const abilityMod = abilityModifier(character.abilityScores[def.keyAbility]);
    const classSkillBonus = isClassSkill && rank.ranks > 0 ? 3 : 0;
    const armorCheckPenalty = def.armorCheckPenalty ? character.defense.armorCheckPenalty : 0;
    const total = rank.ranks + abilityMod + classSkillBonus + rank.miscModifier - armorCheckPenalty;

    return { skillId: rank.skillId, ranks: rank.ranks, total, isClassSkill };
  });
}

/** Skill points gained per level (before racial modifiers), Core Rulebook rule: min 1/level. */
export function skillPointsForLevel(classDef: ClassDefinition, intModifier: number): number {
  return Math.max(1, classDef.skillPointsPerLevel + intModifier);
}
