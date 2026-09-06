/**
 * Base "Spells per Day" tables (Core Rulebook, Open Game Content), before bonus spells from a
 * high casting-ability score. Index = spell level (0-9); `null` means the class hasn't gained
 * access to that spell level yet at this class level, `0` means it has access but no base slots
 * there yet (still eligible for a bonus spell from a high ability score, per RAW).
 *
 * Cleric and Druid share the Wizard's numeric progression in the Core Rulebook; the Cleric's
 * extra +1 domain spell per level isn't modeled here (no domain system exists in this app yet).
 * Paladin and Ranger share an identical table. Transcribed from the Core Rulebook — double-check
 * against your rulebook if you spot a discrepancy.
 */
export type SpellSlotRow = readonly (number | null)[];

const FULL_CASTER_TABLE: Record<number, SpellSlotRow> = {
  1: [3, 1, null, null, null, null, null, null, null, null],
  2: [4, 2, null, null, null, null, null, null, null, null],
  3: [4, 2, 1, null, null, null, null, null, null, null],
  4: [4, 3, 2, null, null, null, null, null, null, null],
  5: [4, 3, 2, 1, null, null, null, null, null, null],
  6: [4, 3, 3, 2, null, null, null, null, null, null],
  7: [4, 4, 3, 2, 1, null, null, null, null, null],
  8: [4, 4, 3, 3, 2, null, null, null, null, null],
  9: [4, 4, 4, 3, 2, 1, null, null, null, null],
  10: [4, 4, 4, 3, 3, 2, null, null, null, null],
  11: [4, 4, 4, 4, 3, 2, 1, null, null, null],
  12: [4, 4, 4, 4, 3, 3, 2, null, null, null],
  13: [4, 4, 4, 4, 4, 3, 2, 1, null, null],
  14: [4, 4, 4, 4, 4, 3, 3, 2, null, null],
  15: [4, 4, 4, 4, 4, 4, 3, 2, 1, null],
  16: [4, 4, 4, 4, 4, 4, 3, 3, 2, null],
  17: [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],
  18: [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],
  19: [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],
  20: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
};

const SORCERER_TABLE: Record<number, SpellSlotRow> = {
  1: [3, null, null, null, null, null, null, null, null, null],
  2: [4, null, null, null, null, null, null, null, null, null],
  3: [5, null, null, null, null, null, null, null, null, null],
  4: [6, 3, null, null, null, null, null, null, null, null],
  5: [6, 4, null, null, null, null, null, null, null, null],
  6: [6, 5, 3, null, null, null, null, null, null, null],
  7: [6, 6, 4, null, null, null, null, null, null, null],
  8: [6, 6, 5, 3, null, null, null, null, null, null],
  9: [6, 6, 6, 4, null, null, null, null, null, null],
  10: [6, 6, 6, 5, 3, null, null, null, null, null],
  11: [6, 6, 6, 6, 4, null, null, null, null, null],
  12: [6, 6, 6, 6, 5, 3, null, null, null, null],
  13: [6, 6, 6, 6, 6, 4, null, null, null, null],
  14: [6, 6, 6, 6, 6, 5, 3, null, null, null],
  15: [6, 6, 6, 6, 6, 6, 4, null, null, null],
  16: [6, 6, 6, 6, 6, 6, 5, 3, null, null],
  17: [6, 6, 6, 6, 6, 6, 6, 4, null, null],
  18: [6, 6, 6, 6, 6, 6, 6, 5, 3, null],
  19: [6, 6, 6, 6, 6, 6, 6, 6, 4, null],
  20: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
};

const BARD_TABLE: Record<number, SpellSlotRow> = {
  1: [1, null, null, null, null, null, null, null, null, null],
  2: [2, null, null, null, null, null, null, null, null, null],
  3: [3, null, null, null, null, null, null, null, null, null],
  4: [3, 1, null, null, null, null, null, null, null, null],
  5: [4, 2, null, null, null, null, null, null, null, null],
  6: [4, 3, null, null, null, null, null, null, null, null],
  7: [4, 3, 1, null, null, null, null, null, null, null],
  8: [4, 4, 2, null, null, null, null, null, null, null],
  9: [5, 4, 3, null, null, null, null, null, null, null],
  10: [5, 4, 3, 1, null, null, null, null, null, null],
  11: [5, 4, 4, 2, null, null, null, null, null, null],
  12: [5, 5, 4, 3, null, null, null, null, null, null],
  13: [5, 5, 4, 3, 1, null, null, null, null, null],
  14: [5, 5, 4, 4, 2, null, null, null, null, null],
  15: [5, 5, 5, 4, 3, null, null, null, null, null],
  16: [5, 5, 5, 4, 3, 1, null, null, null, null],
  17: [5, 5, 5, 4, 4, 2, null, null, null, null],
  18: [5, 5, 5, 5, 4, 3, null, null, null, null],
  19: [5, 5, 5, 5, 5, 4, null, null, null, null],
  20: [5, 5, 5, 5, 5, 5, null, null, null, null],
};

// Paladin and Ranger: no 0-level spells, spellcasting starts at class level 4, caps at 4th level.
const PALADIN_RANGER_TABLE: Record<number, SpellSlotRow> = {
  1: [null, null, null, null, null, null, null, null, null, null],
  2: [null, null, null, null, null, null, null, null, null, null],
  3: [null, null, null, null, null, null, null, null, null, null],
  4: [null, 0, null, null, null, null, null, null, null, null],
  5: [null, 1, null, null, null, null, null, null, null, null],
  6: [null, 1, null, null, null, null, null, null, null, null],
  7: [null, 1, 0, null, null, null, null, null, null, null],
  8: [null, 1, 1, null, null, null, null, null, null, null],
  9: [null, 2, 1, null, null, null, null, null, null, null],
  10: [null, 2, 1, 0, null, null, null, null, null, null],
  11: [null, 2, 1, 1, null, null, null, null, null, null],
  12: [null, 2, 2, 1, null, null, null, null, null, null],
  13: [null, 3, 2, 1, 0, null, null, null, null, null],
  14: [null, 3, 2, 1, 1, null, null, null, null, null],
  15: [null, 3, 2, 2, 1, null, null, null, null, null],
  16: [null, 3, 3, 2, 1, null, null, null, null, null],
  17: [null, 4, 3, 2, 1, null, null, null, null, null],
  18: [null, 4, 3, 2, 2, null, null, null, null, null],
  19: [null, 4, 3, 3, 2, null, null, null, null, null],
  20: [null, 4, 4, 3, 3, null, null, null, null, null],
};

const SPELL_SLOT_TABLES: Record<string, Record<number, SpellSlotRow> | undefined> = {
  wizard: FULL_CASTER_TABLE,
  cleric: FULL_CASTER_TABLE,
  druid: FULL_CASTER_TABLE,
  sorcerer: SORCERER_TABLE,
  bard: BARD_TABLE,
  paladin: PALADIN_RANGER_TABLE,
  ranger: PALADIN_RANGER_TABLE,
};

/** Base slots per day (before bonus spells) for a class at a given class level, or null if the class isn't a recognized caster. */
export function baseSpellSlotsForClass(classId: string, classLevel: number): SpellSlotRow | null {
  const table = SPELL_SLOT_TABLES[classId];
  if (!table) return null;
  const clamped = Math.max(1, Math.min(20, Math.round(classLevel)));
  return table[clamped] ?? null;
}
