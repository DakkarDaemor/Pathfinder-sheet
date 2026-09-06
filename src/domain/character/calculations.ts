import { ABILITY_NAMES, abilityModifier, type AbilityScores } from "@/domain/shared/abilities";
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
import {
  calculateCarryingCapacity,
  encumberedSpeed,
  encumbrancePenaltyFor,
  resolveEncumbranceLevel,
  type CarryingCapacity,
  type EncumbranceLevel,
} from "@/domain/shared/encumbrance";
import { baseAttackBonus, baseSaveBonus } from "@/domain/shared/progressions";
import { sizeModifierAC } from "@/domain/shared/size";
import { ARMORS_BY_ID, WEAPONS_BY_ID } from "@/content/equipment";
import type { ArmorDefinition, ClassDefinition, RaceDefinition, SkillDefinition, WeaponDefinition } from "@/content/types";
import { resolveFeatBonuses, type FeatBonuses, type FeatLookup } from "./featEffects";
import type { CustomArmorStats, CustomWeaponStats, PlayerCharacter } from "./types";

export type ClassLookup = Record<string, ClassDefinition | undefined>;
export type SkillLookup = Record<string, SkillDefinition | undefined>;
export type RaceLookup = Record<string, RaceDefinition | undefined>;

/**
 * Base ability scores plus racial adjustments (`RaceDefinition.abilityAdjustments`) and the
 * player's chosen ability for a floating racial bonus (e.g. Human +2), if any. All combat/skill
 * calculations below use these effective scores rather than the character's raw base scores.
 */
export function deriveEffectiveAbilityScores(character: PlayerCharacter, racesById: RaceLookup): AbilityScores {
  const race = racesById[character.raceId];
  const scores = { ...character.abilityScores };
  if (!race) return scores;

  for (const ability of ABILITY_NAMES) {
    scores[ability] += race.abilityAdjustments[ability] ?? 0;
  }
  if (race.floatingAbilityBonus && character.floatingAbilityChoice) {
    scores[character.floatingAbilityChoice] += race.floatingAbilityBonus;
  }
  return scores;
}

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

function customArmorAsDefinition(custom: CustomArmorStats): Pick<ArmorDefinition, "category" | "acBonus" | "maxDexBonus" | "checkPenalty"> {
  return custom;
}

/**
 * AC/check-penalty contribution from equipped armor and shields — catalog items (via
 * `equipmentId`) or a structured custom definition (`customArmor`), which is given the exact
 * same treatment. Per Pathfinder rules, armor bonuses don't stack with other armor bonuses (same
 * for shields) — only the best applies — but check penalties from armor and a shield do stack.
 *
 * `ArmorDefinition.checkPenalty` (and `CustomArmorStats.checkPenalty`) is stored as a negative
 * number (e.g. -1), while `DefenseLoadout.armorCheckPenalty` is a positive magnitude that callers
 * (see `deriveSkillTotals` below) subtract from totals — the sign is flipped here to match.
 */
export function resolveEquipmentDefenseBonuses(inventory: PlayerCharacter["inventory"]): EquipmentDefenseBonuses {
  let armorBonus = 0;
  let shieldBonus = 0;
  let armorCheckPenalty = 0;
  let armorMaxDexBonus: number | null = null;

  for (const item of inventory) {
    if (!item.equipped) continue;
    const armorDef = item.equipmentId ? ARMORS_BY_ID[item.equipmentId] : item.customArmor ? customArmorAsDefinition(item.customArmor) : undefined;
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

export function totalInventoryWeight(inventory: PlayerCharacter["inventory"]): number {
  return inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);
}

export interface EncumbranceInfo {
  totalWeight: number;
  capacity: CarryingCapacity;
  level: EncumbranceLevel;
  speed: number | null; // base race speed reduced for a medium/heavy load; null if the race is unknown
}

/**
 * A medium or heavy carried load imposes the same max-Dex-to-AC cap and check penalty as
 * medium/heavy armor (Core Rulebook carrying capacity rules), and reduces speed the same way.
 * This combines with — rather than replaces — any penalty from actually worn armor.
 */
function resolveEncumbrance(character: PlayerCharacter, effectiveStr: number, race: RaceDefinition | undefined): EncumbranceInfo {
  const totalWeight = totalInventoryWeight(character.inventory);
  const capacity = calculateCarryingCapacity(effectiveStr, character.size);
  const level = resolveEncumbranceLevel(totalWeight, capacity);
  const speed = race ? encumberedSpeed(race.speed, level) : null;
  return { totalWeight, capacity, level, speed };
}

interface CombinedDefense {
  defense: DefenseLoadout;
  equipmentDefenseBonuses: EquipmentDefenseBonuses;
  encumbrance: EncumbranceInfo;
}

/** Merges manual DefenseLoadout fields with equipped-gear, encumbrance, and feat (e.g. Dodge) contributions. */
function resolveCombinedDefense(
  character: PlayerCharacter,
  effectiveAbilityScores: AbilityScores,
  racesById: RaceLookup,
  featBonuses: FeatBonuses,
): CombinedDefense {
  const race = racesById[character.raceId];
  const equipmentDefenseBonuses = resolveEquipmentDefenseBonuses(character.inventory);
  const encumbrance = resolveEncumbrance(character, effectiveAbilityScores.str, race);
  const encumbrancePenalty = encumbrancePenaltyFor(encumbrance.level);

  const defense: DefenseLoadout = {
    ...character.defense,
    armorBonus: character.defense.armorBonus + equipmentDefenseBonuses.armorBonus,
    shieldBonus: character.defense.shieldBonus + equipmentDefenseBonuses.shieldBonus,
    armorCheckPenalty:
      character.defense.armorCheckPenalty + equipmentDefenseBonuses.armorCheckPenalty + -encumbrancePenalty.checkPenalty,
    armorMaxDexBonus: combineMaxDex(
      combineMaxDex(character.defense.armorMaxDexBonus, equipmentDefenseBonuses.armorMaxDexBonus),
      encumbrancePenalty.maxDexBonus,
    ),
    dodge: character.defense.dodge + featBonuses.dodgeAc,
  };

  return { defense, equipmentDefenseBonuses, encumbrance };
}

/** Average hit die value used for every level after the character's very first (Core Rulebook "take average" rule). */
function averageHitDie(hitDie: number): number {
  return Math.ceil((hitDie + 1) / 2);
}

/**
 * v1 simplification: only the character's very first class level rolls/takes the *maximum*
 * hit die; every other level (further levels in that class, or the first level of any class
 * added later for a multiclass character) takes the average. This matches RAW for single-classed
 * characters; for multiclass characters RAW only grants max HD on true character level 1, which
 * this approximates by treating `classLevels[0]` as that first class.
 */
export function deriveHitPointsMax(character: PlayerCharacter, classesById: ClassLookup, effectiveAbilityScores: AbilityScores): number {
  const conMod = abilityModifier(effectiveAbilityScores.con);
  let total = 0;
  let isFirstLevelOverall = true;

  for (const cl of character.classLevels) {
    const def = classesById[cl.classId];
    if (!def) continue;
    for (let i = 0; i < cl.level; i++) {
      total += isFirstLevelOverall ? def.hitDie : averageHitDie(def.hitDie);
      isFirstLevelOverall = false;
      total += conMod;
    }
  }
  return total;
}

export interface CharacterCombatSheet {
  baseAttackBonus: number;
  armorClass: ArmorClassResult;
  savingThrows: BaseSaves;
  initiative: number;
  combatManeuvers: CombatManeuvers;
  carryingCapacity: CarryingCapacity;
  equipmentDefenseBonuses: EquipmentDefenseBonuses;
  encumbrance: EncumbranceInfo;
  hitPointsMax: number;
  effectiveAbilityScores: AbilityScores;
}

export function deriveCombatSheet(
  character: PlayerCharacter,
  classesById: ClassLookup,
  racesById: RaceLookup,
  featsById: FeatLookup,
): CharacterCombatSheet {
  const effectiveAbilityScores = deriveEffectiveAbilityScores(character, racesById);
  const featBonuses = resolveFeatBonuses(character, featsById);
  const bab = resolveBaseAttackBonus(character, classesById);
  const baseSaves = resolveBaseSaves(character, classesById);
  const { defense, equipmentDefenseBonuses, encumbrance } = resolveCombinedDefense(character, effectiveAbilityScores, racesById, featBonuses);
  const profile: CreatureCombatProfile = {
    size: character.size,
    abilityScores: effectiveAbilityScores,
    baseAttackBonus: bab,
    baseSaves,
    defense,
    miscSaveBonuses: featBonuses.savingThrows,
    miscInitiative: featBonuses.initiative,
  };

  return {
    baseAttackBonus: bab,
    armorClass: calculateArmorClass(profile),
    savingThrows: calculateSavingThrows(profile),
    initiative: calculateInitiative(profile),
    combatManeuvers: calculateCombatManeuvers(profile),
    carryingCapacity: encumbrance.capacity,
    equipmentDefenseBonuses,
    encumbrance,
    hitPointsMax: deriveHitPointsMax(character, classesById, effectiveAbilityScores) + featBonuses.hitPoints,
    effectiveAbilityScores,
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
  customDamageTypes: boolean; // true when damageTypes are free text (custom weapon), not i18n keys
}

function customWeaponAsDefinition(custom: CustomWeaponStats): Pick<WeaponDefinition, "damage" | "critRange" | "critMultiplier" | "damageTypes"> {
  return {
    damage: custom.damage,
    critRange: custom.critRange,
    critMultiplier: custom.critMultiplier,
    damageTypes: custom.damageTypes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

/**
 * One attack per equipped weapon — catalog (via `equipmentId`) or a structured custom definition
 * (`customWeapon`), which now gets the same treatment. v1 simplification (matches the paper-sheet
 * baseline, not full RAW): damage always uses the Str modifier, no finesse/two-handed/off-hand
 * rules — use the character's misc modifiers for those cases. A feat like Weapon Focus is picked
 * against a catalog weapon id, so its bonus only applies to catalog weapons, not custom ones.
 */
export function deriveAttacks(character: PlayerCharacter, classesById: ClassLookup, racesById: RaceLookup, featsById: FeatLookup): DerivedAttack[] {
  const effectiveAbilityScores = deriveEffectiveAbilityScores(character, racesById);
  const featBonuses = resolveFeatBonuses(character, featsById);
  const bab = resolveBaseAttackBonus(character, classesById);
  const strMod = abilityModifier(effectiveAbilityScores.str);
  const sizeMod = sizeModifierAC(character.size);
  const attackBonus = bab + strMod + sizeMod;

  const attacks: DerivedAttack[] = [];
  for (const item of character.inventory) {
    if (!item.equipped) continue;
    const weaponDef = item.equipmentId ? WEAPONS_BY_ID[item.equipmentId] : item.customWeapon ? customWeaponAsDefinition(item.customWeapon) : undefined;
    if (!weaponDef) continue;
    const weaponFeatBonus = item.equipmentId ? (featBonuses.weaponAttackBonuses[item.equipmentId] ?? 0) : 0;
    attacks.push({
      inventoryItemId: item.id,
      name: item.name,
      attackBonus: attackBonus + weaponFeatBonus,
      damageDice: weaponDef.damage,
      damageBonus: strMod,
      critRange: weaponDef.critRange,
      critMultiplier: weaponDef.critMultiplier,
      damageTypes: weaponDef.damageTypes,
      customDamageTypes: !item.equipmentId,
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
  racesById: RaceLookup,
  featsById: FeatLookup,
): SkillTotal[] {
  const effectiveAbilityScores = deriveEffectiveAbilityScores(character, racesById);
  const featBonuses = resolveFeatBonuses(character, featsById);
  // Reuses the same combined check penalty (manual + equipped armor/shield + encumbrance) that
  // feeds AC, so a skill's penalty always matches what's shown on the Combat tab.
  const { defense } = resolveCombinedDefense(character, effectiveAbilityScores, racesById, featBonuses);

  return character.skills.map((rank) => {
    const def = skillsById[rank.skillId];
    const featBonus = featBonuses.skillBonuses[rank.skillId] ?? 0;
    if (!def) {
      return { skillId: rank.skillId, ranks: rank.ranks, total: rank.ranks + rank.miscModifier + featBonus, isClassSkill: false };
    }

    const isClassSkill = isClassSkillFor(rank.skillId, character, classesById);
    const abilityMod = abilityModifier(effectiveAbilityScores[def.keyAbility]);
    const classSkillBonus = isClassSkill && rank.ranks > 0 ? 3 : 0;
    const armorCheckPenalty = def.armorCheckPenalty ? defense.armorCheckPenalty : 0;
    const total = rank.ranks + abilityMod + classSkillBonus + rank.miscModifier + featBonus - armorCheckPenalty;

    return { skillId: rank.skillId, ranks: rank.ranks, total, isClassSkill };
  });
}

/** Skill points gained per level (before racial modifiers), Core Rulebook rule: min 1/level. */
export function skillPointsForLevel(classDef: ClassDefinition, intModifier: number): number {
  return Math.max(1, classDef.skillPointsPerLevel + intModifier);
}
