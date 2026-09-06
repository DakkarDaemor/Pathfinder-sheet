import { describe, expect, it } from "vitest";
import { createDefaultAbilityScores } from "@/domain/shared/abilities";
import { createDefaultDefenseLoadout } from "@/domain/shared/creature";
import type { ClassDefinition, RaceDefinition } from "@/content/types";
import type { ClassLookup, RaceLookup } from "./calculations";
import { applyBonusSpells, deriveSpellDC, deriveSpellSlots } from "./spellcasting";
import type { KnownSpell, PlayerCharacter } from "./types";

const wizard: ClassDefinition = {
  id: "wizard",
  nameKey: "srd:class.wizard.name",
  hitDie: 6,
  babProgression: "half",
  saveProgressions: { fort: "poor", ref: "poor", will: "good" },
  skillPointsPerLevel: 2,
  classSkillIds: [],
  isSpellcaster: true,
  spellcastingAbility: "int",
  features: [],
};

const fighter: ClassDefinition = {
  id: "fighter",
  nameKey: "srd:class.fighter.name",
  hitDie: 10,
  babProgression: "full",
  saveProgressions: { fort: "good", ref: "poor", will: "poor" },
  skillPointsPerLevel: 2,
  classSkillIds: [],
  isSpellcaster: false,
  features: [],
};

const classesById: ClassLookup = { wizard, fighter };

const human: RaceDefinition = {
  id: "human",
  nameKey: "srd:race.human",
  size: "medium",
  speed: 30,
  abilityAdjustments: {},
  floatingAbilityBonus: 2,
  traitKeys: [],
};

const racesById: RaceLookup = { human };

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

describe("applyBonusSpells", () => {
  it("adds no bonus for a modifier below +1", () => {
    const base = [3, 1, null, null, null, null, null, null, null, null] as const;
    expect(applyBonusSpells(base, 0)).toEqual(base);
  });

  it("adds one bonus spell per level from 1 up to the modifier, never to cantrips or inaccessible levels", () => {
    const base = [4, 3, 2, null, null, null, null, null, null, null] as const;
    expect(applyBonusSpells(base, 2)).toEqual([4, 4, 3, null, null, null, null, null, null, null]);
  });

  it("does not grant a bonus at a level the class hasn't unlocked yet, even with a very high modifier", () => {
    const base = [null, 0, null, null, null, null, null, null, null, null] as const; // paladin-shaped: level 1 not yet accessible
    expect(applyBonusSpells(base, 9)).toEqual([null, 1, null, null, null, null, null, null, null, null]);
  });
});

describe("deriveSpellSlots", () => {
  it("returns the base wizard table plus Int-based bonus spells, and skips non-caster classes", () => {
    const character = baseCharacter({
      classLevels: [
        { classId: "wizard", level: 5 },
        { classId: "fighter", level: 2 },
      ],
      abilityScores: { ...createDefaultAbilityScores(10), int: 16 }, // +3 mod
    });

    const slots = deriveSpellSlots(character, classesById, racesById);
    expect(slots).toHaveLength(1);
    // base wizard lvl5: [4,3,2,1,...]; +3 mod adds +1 to levels 1-3
    expect(slots[0]?.slotsByLevel).toEqual([4, 4, 3, 2, null, null, null, null, null, null]);
  });
});

describe("deriveSpellDC", () => {
  it("computes 10 + spell level + ability mod for a catalog spell", () => {
    const character = baseCharacter({
      classLevels: [{ classId: "wizard", level: 3 }],
      abilityScores: { ...createDefaultAbilityScores(10), int: 16 }, // +3 mod
    });
    const known: KnownSpell = {
      id: "k1",
      spellId: "magicMissile", // wizard 1st-level spell
      customName: "",
      customDescription: "",
      customSchool: "",
      customLevel: 0,
      customSpellcastingClassId: null,
      prepared: false,
    };
    expect(deriveSpellDC(known, character, classesById, racesById)).toBe(10 + 1 + 3);
  });

  it("computes DC for a custom spell using the player-picked casting class", () => {
    const character = baseCharacter({
      classLevels: [{ classId: "wizard", level: 3 }],
      abilityScores: { ...createDefaultAbilityScores(10), int: 14 }, // +2 mod
    });
    const known: KnownSpell = {
      id: "k2",
      spellId: null,
      customName: "Homebrew Bolt",
      customDescription: "",
      customSchool: "evocation",
      customLevel: 2,
      customSpellcastingClassId: "wizard",
      prepared: false,
    };
    expect(deriveSpellDC(known, character, classesById, racesById)).toBe(10 + 2 + 2);
  });

  it("returns null when a custom spell has no casting class picked", () => {
    const character = baseCharacter({ classLevels: [{ classId: "wizard", level: 3 }] });
    const known: KnownSpell = {
      id: "k3",
      spellId: null,
      customName: "Mystery Spell",
      customDescription: "",
      customSchool: "",
      customLevel: 1,
      customSpellcastingClassId: null,
      prepared: false,
    };
    expect(deriveSpellDC(known, character, classesById, racesById)).toBeNull();
  });
});
