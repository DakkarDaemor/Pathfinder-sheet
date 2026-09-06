import { describe, expect, it } from "vitest";
import { createDefaultAbilityScores } from "@/domain/shared/abilities";
import { createDefaultDefenseLoadout } from "@/domain/shared/creature";
import type { RaceDefinition } from "@/content/types";
import { resolveRaceBonuses, type RaceLookup } from "./raceEffects";
import type { PlayerCharacter } from "./types";

const dwarf: RaceDefinition = {
  id: "dwarf",
  nameKey: "srd:race.dwarf",
  size: "medium",
  speed: 20,
  abilityAdjustments: { con: 2, wis: 2, cha: -2 },
  // All of a Dwarf's real traits are conditional (vs poison/spells, vs giants, etc.), so none
  // carry an `effects` entry — this fixture doubles as the "no automatic bonus" baseline.
  traits: [{ nameKey: "srd:raceTrait.hardy" }, { nameKey: "srd:raceTrait.defensiveTraining" }],
};

const halfling: RaceDefinition = {
  id: "halfling",
  nameKey: "srd:race.halfling",
  size: "small",
  speed: 20,
  abilityAdjustments: { dex: 2, cha: 2, str: -2 },
  traits: [
    { nameKey: "srd:raceTrait.fearless" },
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
  ],
};

const gnome: RaceDefinition = {
  id: "gnome",
  nameKey: "srd:race.gnome",
  size: "small",
  speed: 20,
  abilityAdjustments: { con: 2, cha: 2, str: -2 },
  traits: [
    { nameKey: "srd:raceTrait.obsessive", effects: [{ kind: "skillFocusChoice", bonus: 2 }] },
  ],
};

const human: RaceDefinition = {
  id: "human",
  nameKey: "srd:race.human",
  size: "medium",
  speed: 30,
  abilityAdjustments: {},
  floatingAbilityBonus: 2,
  traits: [
    { nameKey: "srd:raceTrait.bonusFeat", effects: [{ kind: "bonusFeatSlot", count: 1 }] },
    { nameKey: "srd:raceTrait.skilled", effects: [{ kind: "extraSkillPointPerLevel", bonus: 1 }] },
  ],
};

const racesById: RaceLookup = { dwarf, halfling, gnome, human };

function baseCharacter(overrides: Partial<PlayerCharacter> = {}): PlayerCharacter {
  return {
    id: "char-1",
    schemaVersion: 1,
    name: "Test",
    playerName: "",
    raceId: "human",
    alignment: "",
    deity: "",
    size: "medium",
    classLevels: [],
    abilityScores: createDefaultAbilityScores(10),
    floatingAbilityChoice: null,
    floatingSkillChoice: null,
    hitPoints: { max: 1, current: 1, nonLethal: 0, autoMax: false },
    defense: createDefaultDefenseLoadout(),
    skills: [],
    feats: [],
    traits: [],
    inventory: [],
    spells: [],
    companions: [],
    notes: "",
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

describe("resolveRaceBonuses", () => {
  it("grants nothing for an unknown race or a race whose traits are all conditional (Dwarf)", () => {
    expect(resolveRaceBonuses(baseCharacter({ raceId: "does-not-exist" }), racesById)).toEqual({
      savingThrows: {},
      skillBonuses: {},
      extraSkillPointsPerLevel: 0,
      bonusFeatSlots: 0,
    });
    expect(resolveRaceBonuses(baseCharacter({ raceId: "dwarf" }), racesById)).toEqual({
      savingThrows: {},
      skillBonuses: {},
      extraSkillPointsPerLevel: 0,
      bonusFeatSlots: 0,
    });
  });

  it("sums an unconditional saving-throw bonus across all three saves (Halfling Luck)", () => {
    const bonuses = resolveRaceBonuses(baseCharacter({ raceId: "halfling" }), racesById);
    expect(bonuses.savingThrows).toEqual({ fort: 1, ref: 1, will: 1 });
  });

  it("sums unconditional skill bonuses, including a trait granting more than one (Sure-Footed)", () => {
    const bonuses = resolveRaceBonuses(baseCharacter({ raceId: "halfling" }), racesById);
    expect(bonuses.skillBonuses).toEqual({ perception: 2, acrobatics: 2, climb: 2 });
  });

  it("applies a player-chosen skill bonus (Gnome Obsessive) only once a skill is picked", () => {
    const unpicked = resolveRaceBonuses(baseCharacter({ raceId: "gnome" }), racesById);
    expect(unpicked.skillBonuses).toEqual({});

    const picked = resolveRaceBonuses(
      baseCharacter({ raceId: "gnome", floatingSkillChoice: "craft" }),
      racesById,
    );
    expect(picked.skillBonuses).toEqual({ craft: 2 });
  });

  it("reports extra skill points per level and bonus feat slots (Human)", () => {
    const bonuses = resolveRaceBonuses(baseCharacter({ raceId: "human" }), racesById);
    expect(bonuses.extraSkillPointsPerLevel).toBe(1);
    expect(bonuses.bonusFeatSlots).toBe(1);
  });
});
