import { abilityModifier, type AbilityScores } from "./abilities";
import { sizeModifierAC, sizeModifierCMB, type SizeCategory } from "./size";

/** Armor/shield/defensive inputs shared by any creature (PC or companion). */
export interface DefenseLoadout {
  armorBonus: number;
  armorMaxDexBonus: number | null; // null = no cap
  armorCheckPenalty: number;
  shieldBonus: number;
  naturalArmor: number;
  deflection: number;
  dodge: number;
  miscAc: number;
}

export function createDefaultDefenseLoadout(): DefenseLoadout {
  return {
    armorBonus: 0,
    armorMaxDexBonus: null,
    armorCheckPenalty: 0,
    shieldBonus: 0,
    naturalArmor: 0,
    deflection: 0,
    dodge: 0,
    miscAc: 0,
  };
}

export interface BaseSaves {
  fort: number;
  ref: number;
  will: number;
}

/**
 * Resolved combat inputs for any creature (PC or companion). Base attack bonus and base
 * saves are expected to already be resolved by the caller (for a PC this means summing
 * each class's own progression, per the multiclass rule; for a companion it's a single
 * lookup in its progression table) — this module only turns those into derived stats.
 */
export interface CreatureCombatProfile {
  size: SizeCategory;
  abilityScores: AbilityScores;
  baseAttackBonus: number;
  baseSaves: BaseSaves;
  defense: DefenseLoadout;
  miscSaveBonuses?: Partial<BaseSaves>;
  miscInitiative?: number;
  miscCmb?: number;
  miscCmd?: number;
}

export interface ArmorClassResult {
  normal: number;
  touch: number;
  flatFooted: number;
}

function cappedDexBonus(dexMod: number, maxDex: number | null): number {
  if (maxDex === null) return dexMod;
  return Math.min(dexMod, maxDex);
}

export function calculateArmorClass(profile: CreatureCombatProfile): ArmorClassResult {
  const dexMod = abilityModifier(profile.abilityScores.dex);
  const usableDex = cappedDexBonus(dexMod, profile.defense.armorMaxDexBonus);
  const sizeMod = sizeModifierAC(profile.size);
  const { armorBonus, shieldBonus, naturalArmor, deflection, dodge, miscAc } = profile.defense;

  const normal =
    10 + armorBonus + shieldBonus + usableDex + sizeMod + naturalArmor + deflection + dodge + miscAc;
  const touch = 10 + usableDex + sizeMod + deflection + dodge + miscAc;
  const flatFooted = normal - usableDex - dodge;

  return { normal, touch, flatFooted };
}

export function calculateSavingThrows(profile: CreatureCombatProfile): BaseSaves {
  const conMod = abilityModifier(profile.abilityScores.con);
  const dexMod = abilityModifier(profile.abilityScores.dex);
  const wisMod = abilityModifier(profile.abilityScores.wis);
  const misc = profile.miscSaveBonuses ?? {};

  return {
    fort: profile.baseSaves.fort + conMod + (misc.fort ?? 0),
    ref: profile.baseSaves.ref + dexMod + (misc.ref ?? 0),
    will: profile.baseSaves.will + wisMod + (misc.will ?? 0),
  };
}

export function calculateInitiative(profile: CreatureCombatProfile): number {
  return abilityModifier(profile.abilityScores.dex) + (profile.miscInitiative ?? 0);
}

export interface CombatManeuvers {
  cmb: number;
  cmd: number;
}

export function calculateCombatManeuvers(profile: CreatureCombatProfile): CombatManeuvers {
  const strMod = abilityModifier(profile.abilityScores.str);
  const dexMod = abilityModifier(profile.abilityScores.dex);
  const sizeMod = sizeModifierCMB(profile.size);

  return {
    cmb: profile.baseAttackBonus + strMod + sizeMod + (profile.miscCmb ?? 0),
    cmd: 10 + profile.baseAttackBonus + strMod + dexMod + sizeMod + (profile.miscCmd ?? 0),
  };
}
