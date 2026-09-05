import type { RaceDefinition } from "./types";

/**
 * The 7 core races (Core Rulebook, Open Game Content). Racial skill/save bonuses that come
 * from traits (e.g. Keen Senses, Halfling Luck) are listed as reference text (`traitKeys`)
 * rather than auto-applied to totals — the player adds them to the relevant "misc" modifier
 * field, keeping the calculation engine simple and auditable.
 */
export const RACES: RaceDefinition[] = [
  {
    id: "dwarf",
    nameKey: "srd:race.dwarf",
    size: "medium",
    speed: 20,
    abilityAdjustments: { con: 2, wis: 2, cha: -2 },
    traitKeys: [
      "srd:raceTrait.darkvision60",
      "srd:raceTrait.defensiveTraining",
      "srd:raceTrait.hatred",
      "srd:raceTrait.hardy",
      "srd:raceTrait.stability",
      "srd:raceTrait.greed",
      "srd:raceTrait.stonecunning",
      "srd:raceTrait.dwarfWeaponFamiliarity",
      "srd:raceTrait.slowAndSteady",
    ],
  },
  {
    id: "elf",
    nameKey: "srd:race.elf",
    size: "medium",
    speed: 30,
    abilityAdjustments: { dex: 2, int: 2, con: -2 },
    traitKeys: [
      "srd:raceTrait.lowLightVision",
      "srd:raceTrait.elvenImmunities",
      "srd:raceTrait.keenSenses",
      "srd:raceTrait.elvenMagic",
      "srd:raceTrait.elfWeaponFamiliarity",
    ],
  },
  {
    id: "gnome",
    nameKey: "srd:race.gnome",
    size: "small",
    speed: 20,
    abilityAdjustments: { con: 2, cha: 2, str: -2 },
    traitKeys: [
      "srd:raceTrait.lowLightVision",
      "srd:raceTrait.defensiveTraining",
      "srd:raceTrait.gnomeMagic",
      "srd:raceTrait.hatred",
      "srd:raceTrait.illusionResistance",
      "srd:raceTrait.keenSenses",
      "srd:raceTrait.obsessive",
    ],
  },
  {
    id: "halfElf",
    nameKey: "srd:race.halfElf",
    size: "medium",
    speed: 30,
    abilityAdjustments: {},
    floatingAbilityBonus: 2,
    traitKeys: [
      "srd:raceTrait.lowLightVision",
      "srd:raceTrait.adaptability",
      "srd:raceTrait.elfBlood",
      "srd:raceTrait.elvenImmunities",
      "srd:raceTrait.keenSenses",
      "srd:raceTrait.multitalented",
    ],
  },
  {
    id: "halfOrc",
    nameKey: "srd:race.halfOrc",
    size: "medium",
    speed: 30,
    abilityAdjustments: {},
    floatingAbilityBonus: 2,
    traitKeys: [
      "srd:raceTrait.darkvision60",
      "srd:raceTrait.intimidatingRace",
      "srd:raceTrait.orcBlood",
      "srd:raceTrait.orcFerocity",
      "srd:raceTrait.halfOrcWeaponFamiliarity",
    ],
  },
  {
    id: "halfling",
    nameKey: "srd:race.halfling",
    size: "small",
    speed: 20,
    abilityAdjustments: { dex: 2, cha: 2, str: -2 },
    traitKeys: [
      "srd:raceTrait.fearless",
      "srd:raceTrait.halflingLuck",
      "srd:raceTrait.keenSenses",
      "srd:raceTrait.sureFooted",
      "srd:raceTrait.halflingWeaponFamiliarity",
    ],
  },
  {
    id: "human",
    nameKey: "srd:race.human",
    size: "medium",
    speed: 30,
    abilityAdjustments: {},
    floatingAbilityBonus: 2,
    traitKeys: ["srd:raceTrait.bonusFeat", "srd:raceTrait.skilled"],
  },
];

export const RACES_BY_ID: Record<string, RaceDefinition> = Object.fromEntries(RACES.map((r) => [r.id, r]));
