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
  type DefenseLoadout,
} from "@/domain/shared/creature";
import { calculateCarryingCapacity, type CarryingCapacity } from "@/domain/shared/encumbrance";
import { baseAttackBonus, baseSaveBonus } from "@/domain/shared/progressions";
import { sizeModifierAC } from "@/domain/shared/size";
import { ARMORS_BY_ID, WEAPONS_BY_ID } from "@/content/equipment";
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

export interface EquipmentDefenseBonuses {
  armorBonus: number;
  shieldBonus: number;
  armorCheckPenalty: number;
  armorMaxDexBonus: number | null;
}

/**
 * AC/check-penalty contribution from equipped catalog armor and shields. Per Pathfinder rules,
 * armor bonuses don't stack with other armor bonuses (same for shields) — only the best applies
 * — but check penalties from armor and a shield do stack together.
 *
 * `ArmorDefinition.checkPenalty` is stored as a negative number (e.g. -1), while
 * `DefenseLoadout.armorCheckPenalty` is a positive magnitude that callers (see
 * `deriveSkillTotals` below) subtract from totals — the sign is flipped here to match.
 */
export function resolveEquipmentDefenseBonuses(inventory: PlayerCharacter["inventory"]): EquipmentDefenseBonuses {
  let armorBonus = 0;
  let shieldBonus = 0;
  let armorCheckPenalty = 0;
  let armorMaxDexBonus: number | null = null;

  for (const item of inventory) {
    if (!item.equipped || !item.equipmentId) continue;
    const armorDef = ARMORS_BY_ID[item.equipmentId];
    if (!armorDef) continue;

    armorCheckPenalty += -armorDef.checkPenalty;

    if (armorDef.category === "shield") {
      shieldBonus = Math.max(shieldBonus, armorDef.acBonus);
    } else if (armorDef.acBonus > armorBonus) {
      armorBonus = armorDef.acBonus;
      armorMaxDexBonus = armorDef.maxDexBonus;
    }
  }

  return { armorBonus, shieldBonus, armorCheckPenalty, armorMaxDexBonus };
}

function combineMaxDex(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.min(a, b);
}

export interface CharacterCombatSheet {
  baseAttackBonus: number;
  armorClass: ArmorClassResult;
  savingThrows: BaseSaves;
  initiative: number;
  combatManeuvers: CombatManeuvers;
  carryingCapacity: CarryingCapacity;
  equipmentDefenseBonuses: EquipmentDefenseBonuses;
}

export function deriveCombatSheet(character: PlayerCharacter, classesById: ClassLookup): CharacterCombatSheet {
  const bab = resolveBaseAttackBonus(character, classesById);
  const baseSaves = resolveBaseSaves(character, classesById);
  const equipmentDefenseBonuses = resolveEquipmentDefenseBonuses(character.inventory);
  const defense: DefenseLoadout = {
    ...character.defense,
    armorBonus: character.defense.armorBonus + equipmentDefenseBonuses.armorBonus,
    shieldBonus: character.defense.shieldBonus + equipmentDefenseBonuses.shieldBonus,
    armorCheckPenalty: character.defense.armorCheckPenalty + equipmentDefenseBonuses.armorCheckPenalty,
    armorMaxDexBonus: combineMaxDex(character.defense.armorMaxDexBonus, equipmentDefenseBonuses.armorMaxDexBonus),
  };
  const profile: CreatureCombatProfile = {
    size: character.size,
    abilityScores: character.abilityScores,
    baseAttackBonus: bab,
    baseSaves,
    defense,
  };

  return {
    baseAttackBonus: bab,
    armorClass: calculateArmorClass(profile),
    savingThrows: calculateSavingThrows(profile),
    initiative: calculateInitiative(profile),
    combatManeuvers: calculateCombatManeuvers(profile),
    carryingCapacity: calculateCarryingCapacity(character.abilityScores.str, character.size),
    equipmentDefenseBonuses,
  };
}

export interface DerivedAttack {
  inventoryItemId: string;
  name: string;
  attackBonus: number;
  damageDice: string;
  damageBonus: number;
  critRange: string;
  critMultiplier: number;
  damageTypes: string[];
}

/**
 * One attack per equipped catalog weapon. v1 simplification (matches the paper-sheet baseline,
 * not full RAW): damage always uses the Str modifier, no finesse/two-handed/off-hand rules —
 * use the character's misc modifiers for those cases. Custom (non-catalog) weapons have no
 * structured stats to derive from, so they don't appear here.
 */
export function deriveAttacks(character: PlayerCharacter, classesById: ClassLookup): DerivedAttack[] {
  const bab = resolveBaseAttackBonus(character, classesById);
  const strMod = abilityModifier(character.abilityScores.str);
  const sizeMod = sizeModifierAC(character.size);
  const attackBonus = bab + strMod + sizeMod;

  const attacks: DerivedAttack[] = [];
  for (const item of character.inventory) {
    if (!item.equipped || !item.equipmentId) continue;
    const weaponDef = WEAPONS_BY_ID[item.equipmentId];
    if (!weaponDef) continue;
    attacks.push({
      inventoryItemId: item.id,
      name: item.name,
      attackBonus,
      damageDice: weaponDef.damage,
      damageBonus: strMod,
      critRange: weaponDef.critRange,
      critMultiplier: weaponDef.critMultiplier,
      damageTypes: weaponDef.damageTypes,
    });
  }
  return attacks;
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
