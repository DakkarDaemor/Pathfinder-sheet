import { abilityModifier } from "@/domain/shared/abilities";
import { baseSpellSlotsForClass, type SpellSlotRow } from "@/content/spellSlots";
import { SPELLS_BY_ID } from "@/content/spells";
import { deriveEffectiveAbilityScores, type ClassLookup, type RaceLookup } from "./calculations";
import type { KnownSpell, PlayerCharacter } from "./types";

/**
 * Core Rulebook "Ability Modifiers and Bonus Spells": a caster with ability modifier N gets one
 * extra spell at each spell level from 1 up to N (capped at 9th), but only for a level she can
 * already access (a `null` entry — not yet accessible — never gains a bonus spell; a `0` entry —
 * accessible but no base slots yet — can).
 */
export function applyBonusSpells(base: SpellSlotRow, abilityMod: number): SpellSlotRow {
  if (abilityMod < 1) return base;
  const bonusUpToLevel = Math.min(abilityMod, 9);
  return base.map((slots, level) => {
    if (level === 0 || level > bonusUpToLevel || slots === null) return slots;
    return slots + 1;
  });
}

export interface SpellSlotsForClass {
  classId: string;
  classLevel: number;
  slotsByLevel: SpellSlotRow;
}

/** Spell slots per day for each of the character's spellcasting classes, including bonus spells from ability score. */
export function deriveSpellSlots(character: PlayerCharacter, classesById: ClassLookup, racesById: RaceLookup): SpellSlotsForClass[] {
  const effectiveAbilityScores = deriveEffectiveAbilityScores(character, racesById);

  const result: SpellSlotsForClass[] = [];
  for (const cl of character.classLevels) {
    const def = classesById[cl.classId];
    if (!def?.isSpellcaster || !def.spellcastingAbility) continue;
    const base = baseSpellSlotsForClass(cl.classId, cl.level);
    if (!base) continue;
    const abilityMod = abilityModifier(effectiveAbilityScores[def.spellcastingAbility]);
    result.push({ classId: cl.classId, classLevel: cl.level, slotsByLevel: applyBonusSpells(base, abilityMod) });
  }
  return result;
}

/**
 * Which of the character's own classes a known spell belongs to — for a catalog spell, the first
 * of the character's classes that has it on its list; for a custom spell, the class the player
 * picked (`customSpellcastingClassId`), since a free-text spell has no list to match against.
 */
function resolveSpellcastingClassId(known: KnownSpell, character: PlayerCharacter): string | null {
  if (known.spellId) {
    const def = SPELLS_BY_ID[known.spellId];
    if (!def) return null;
    return character.classLevels.map((cl) => cl.classId).find((classId) => classId in def.levelsByClass) ?? null;
  }
  return known.customSpellcastingClassId;
}

function resolveSpellLevel(known: KnownSpell, classId: string | null): number | null {
  if (known.spellId) {
    const def = SPELLS_BY_ID[known.spellId];
    if (!def || classId === null) return null;
    return def.levelsByClass[classId] ?? null;
  }
  return known.customLevel;
}

/** Spell save DC = 10 + spell level + casting ability modifier; null when it can't be determined (e.g. custom spell with no class picked). */
export function deriveSpellDC(known: KnownSpell, character: PlayerCharacter, classesById: ClassLookup, racesById: RaceLookup): number | null {
  const classId = resolveSpellcastingClassId(known, character);
  const level = resolveSpellLevel(known, classId);
  const classDef = classId ? classesById[classId] : undefined;
  if (level === null || !classDef?.spellcastingAbility) return null;

  const effectiveAbilityScores = deriveEffectiveAbilityScores(character, racesById);
  const abilityMod = abilityModifier(effectiveAbilityScores[classDef.spellcastingAbility]);
  return 10 + level + abilityMod;
}
