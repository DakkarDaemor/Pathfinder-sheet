import type { RaceDefinition, RaceTrait } from "./types";

/** Shorthand for a purely descriptive trait (no automatic effect) — most traits are this. */
function trait(nameKey: string): RaceTrait {
  return { nameKey };
}

/**
 * The 7 core races (Core Rulebook, Open Game Content). Only *unconditional* racial bonuses
 * (e.g. Keen Senses: always +2 Perception) carry an `effects` entry and are auto-applied to
 * totals — conditional ones (e.g. Dwarf Hardy: +2 on saves vs poison/spells only, Defensive
 * Training: +4 AC vs giants only) stay reference text, same as before this existed, since
 * auto-applying them would give a wrong bonus most of the time. See `RaceTraitEffect` for the
 * full rationale.
 */
export const RACES: RaceDefinition[] = [
  {
    id: "dwarf",
    nameKey: "srd:race.dwarf",
    size: "medium",
    speed: 20,
    abilityAdjustments: { con: 2, wis: 2, cha: -2 },
    traits: [
      trait("srd:raceTrait.darkvision60"),
      trait("srd:raceTrait.defensiveTraining"),
      trait("srd:raceTrait.hatred"),
      trait("srd:raceTrait.hardy"),
      trait("srd:raceTrait.stability"),
      trait("srd:raceTrait.greed"),
      trait("srd:raceTrait.stonecunning"),
      trait("srd:raceTrait.dwarfWeaponFamiliarity"),
      trait("srd:raceTrait.slowAndSteady"),
    ],
  },
  {
    id: "elf",
    nameKey: "srd:race.elf",
    size: "medium",
    speed: 30,
    abilityAdjustments: { dex: 2, int: 2, con: -2 },
    traits: [
      trait("srd:raceTrait.lowLightVision"),
      trait("srd:raceTrait.elvenImmunities"),
      {
        nameKey: "srd:raceTrait.keenSenses",
        effects: [{ kind: "skillBonus", skillId: "perception", bonus: 2 }],
      },
      trait("srd:raceTrait.elvenMagic"),
      trait("srd:raceTrait.elfWeaponFamiliarity"),
    ],
  },
  {
    id: "gnome",
    nameKey: "srd:race.gnome",
    size: "small",
    speed: 20,
    abilityAdjustments: { con: 2, cha: 2, str: -2 },
    traits: [
      trait("srd:raceTrait.lowLightVision"),
      trait("srd:raceTrait.defensiveTraining"),
      trait("srd:raceTrait.gnomeMagic"),
      trait("srd:raceTrait.hatred"),
      trait("srd:raceTrait.illusionResistance"),
      {
        nameKey: "srd:raceTrait.keenSenses",
        effects: [{ kind: "skillBonus", skillId: "perception", bonus: 2 }],
      },
      { nameKey: "srd:raceTrait.obsessive", effects: [{ kind: "skillFocusChoice", bonus: 2 }] },
    ],
  },
  {
    id: "halfElf",
    nameKey: "srd:race.halfElf",
    size: "medium",
    speed: 30,
    abilityAdjustments: {},
    floatingAbilityBonus: 2,
    traits: [
      trait("srd:raceTrait.lowLightVision"),
      trait("srd:raceTrait.adaptability"),
      trait("srd:raceTrait.elfBlood"),
      trait("srd:raceTrait.elvenImmunities"),
      {
        nameKey: "srd:raceTrait.keenSenses",
        effects: [{ kind: "skillBonus", skillId: "perception", bonus: 2 }],
      },
      trait("srd:raceTrait.multitalented"),
    ],
  },
  {
    id: "halfOrc",
    nameKey: "srd:race.halfOrc",
    size: "medium",
    speed: 30,
    abilityAdjustments: {},
    floatingAbilityBonus: 2,
    traits: [
      trait("srd:raceTrait.darkvision60"),
      trait("srd:raceTrait.intimidatingRace"),
      trait("srd:raceTrait.orcBlood"),
      trait("srd:raceTrait.orcFerocity"),
      trait("srd:raceTrait.halfOrcWeaponFamiliarity"),
    ],
  },
  {
    id: "halfling",
    nameKey: "srd:race.halfling",
    size: "small",
    speed: 20,
    abilityAdjustments: { dex: 2, cha: 2, str: -2 },
    traits: [
      trait("srd:raceTrait.fearless"),
      { nameKey: "srd:raceTrait.halflingLuck", effects: [{ kind: "savingThrowAll", bonus: 1 }] },
      {
        nameKey: "srd:raceTrait.keenSenses",
        effects: [{ kind: "skillBonus", skillId: "perception", bonus: 2 }],
      },
      {
        nameKey: "srd:raceTrait.sureFooted",
        effects: [
          { kind: "skillBonus", skillId: "acrobatics", bonus: 2 },
          { kind: "skillBonus", skillId: "climb", bonus: 2 },
        ],
      },
      trait("srd:raceTrait.halflingWeaponFamiliarity"),
    ],
  },
  {
    id: "human",
    nameKey: "srd:race.human",
    size: "medium",
    speed: 30,
    abilityAdjustments: {},
    floatingAbilityBonus: 2,
    traits: [
      { nameKey: "srd:raceTrait.bonusFeat", effects: [{ kind: "bonusFeatSlot", count: 1 }] },
      {
        nameKey: "srd:raceTrait.skilled",
        effects: [{ kind: "extraSkillPointPerLevel", bonus: 1 }],
      },
    ],
  },
];

export const RACES_BY_ID: Record<string, RaceDefinition> = Object.fromEntries(
  RACES.map((r) => [r.id, r]),
);
