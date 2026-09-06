import { describe, expect, it } from "vitest";
import { createDefaultAbilityScores } from "@/domain/shared/abilities";
import { createDefaultDefenseLoadout } from "@/domain/shared/creature";
import type { FeatDefinition } from "@/content/types";
import { resolveFeatBonuses, type FeatLookup } from "./featEffects";
import type { FeatSlot, PlayerCharacter } from "./types";

const dodge: FeatDefinition = {
  id: "dodge",
  nameKey: "srd:feat.dodge.name",
  descriptionKey: "srd:feat.dodge.description",
  prerequisiteKey: null,
  type: "combat",
  effect: { kind: "dodgeAc", bonus: 1 },
};

const greatFortitude: FeatDefinition = {
  id: "greatFortitude",
  nameKey: "srd:feat.greatFortitude.name",
  descriptionKey: "srd:feat.greatFortitude.description",
  prerequisiteKey: null,
  type: "general",
  effect: { kind: "savingThrow", save: "fort", bonus: 2 },
};

const improvedInitiative: FeatDefinition = {
  id: "improvedInitiative",
  nameKey: "srd:feat.improvedInitiative.name",
  descriptionKey: "srd:feat.improvedInitiative.description",
  prerequisiteKey: null,
  type: "combat",
  effect: { kind: "initiative", bonus: 4 },
};

const toughness: FeatDefinition = {
  id: "toughness",
  nameKey: "srd:feat.toughness.name",
  descriptionKey: "srd:feat.toughness.description",
  prerequisiteKey: null,
  type: "general",
  effect: { kind: "hitPoints" },
};

const skillFocus: FeatDefinition = {
  id: "skillFocus",
  nameKey: "srd:feat.skillFocus.name",
  descriptionKey: "srd:feat.skillFocus.description",
  prerequisiteKey: null,
  type: "general",
  effect: { kind: "skillFocus", bonus: 3, bonusAtTenRanks: 6 },
};

const weaponFocus: FeatDefinition = {
  id: "weaponFocus",
  nameKey: "srd:feat.weaponFocus.name",
  descriptionKey: "srd:feat.weaponFocus.description",
  prerequisiteKey: null,
  type: "combat",
  effect: { kind: "weaponAttackBonus", bonus: 1 },
};

const featureless: FeatDefinition = {
  id: "acrobatic",
  nameKey: "srd:feat.acrobatic.name",
  descriptionKey: "srd:feat.acrobatic.description",
  prerequisiteKey: null,
  type: "general",
};

const featsById: FeatLookup = {
  dodge,
  greatFortitude,
  improvedInitiative,
  toughness,
  skillFocus,
  weaponFocus,
  acrobatic: featureless,
};

function featSlot(overrides: Partial<FeatSlot>): FeatSlot {
  return {
    id: "feat-1",
    featId: null,
    customName: "",
    customDescription: "",
    customType: "general",
    selectedSkillId: null,
    selectedWeaponId: null,
    notes: "",
    ...overrides,
  };
}

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

describe("resolveFeatBonuses", () => {
  it("ignores a feat with no structured effect, a custom feat, and an unknown feat id", () => {
    const character = baseCharacter({
      feats: [
        featSlot({ featId: "acrobatic" }),
        featSlot({ featId: null, customName: "Homebrew" }),
        featSlot({ featId: "does-not-exist" }),
      ],
    });
    const bonuses = resolveFeatBonuses(character, featsById);
    expect(bonuses).toEqual({
      savingThrows: {},
      initiative: 0,
      dodgeAc: 0,
      hitPoints: 0,
      skillBonuses: {},
      weaponAttackBonuses: {},
    });
  });

  it("sums flat bonuses: saving throw, initiative, dodge AC", () => {
    const character = baseCharacter({
      feats: [
        featSlot({ featId: "greatFortitude" }),
        featSlot({ featId: "improvedInitiative" }),
        featSlot({ featId: "dodge" }),
      ],
    });
    const bonuses = resolveFeatBonuses(character, featsById);
    expect(bonuses.savingThrows).toEqual({ fort: 2 });
    expect(bonuses.initiative).toBe(4);
    expect(bonuses.dodgeAc).toBe(1);
  });

  it("computes Toughness as +3 up to 3 HD, then equal to the HD count, and grants nothing at level 0", () => {
    const level2 = baseCharacter({
      classLevels: [{ classId: "fighter", level: 2 }],
      feats: [featSlot({ featId: "toughness" })],
    });
    expect(resolveFeatBonuses(level2, featsById).hitPoints).toBe(3);

    const level5 = baseCharacter({
      classLevels: [{ classId: "fighter", level: 5 }],
      feats: [featSlot({ featId: "toughness" })],
    });
    expect(resolveFeatBonuses(level5, featsById).hitPoints).toBe(5);

    const level0 = baseCharacter({ feats: [featSlot({ featId: "toughness" })] });
    expect(resolveFeatBonuses(level0, featsById).hitPoints).toBe(0);
  });

  it("applies Skill Focus's +3 (or +6 at 10+ ranks) only to the chosen skill", () => {
    const lowRanks = baseCharacter({
      skills: [{ skillId: "climb", ranks: 4, miscModifier: 0 }],
      feats: [featSlot({ featId: "skillFocus", selectedSkillId: "climb" })],
    });
    expect(resolveFeatBonuses(lowRanks, featsById).skillBonuses).toEqual({ climb: 3 });

    const highRanks = baseCharacter({
      skills: [{ skillId: "climb", ranks: 10, miscModifier: 0 }],
      feats: [featSlot({ featId: "skillFocus", selectedSkillId: "climb" })],
    });
    expect(resolveFeatBonuses(highRanks, featsById).skillBonuses).toEqual({ climb: 6 });
  });

  it("grants no Skill Focus bonus when no skill has been chosen yet", () => {
    const character = baseCharacter({
      feats: [featSlot({ featId: "skillFocus", selectedSkillId: null })],
    });
    expect(resolveFeatBonuses(character, featsById).skillBonuses).toEqual({});
  });

  it("applies Weapon Focus's bonus only to the chosen weapon id", () => {
    const character = baseCharacter({
      feats: [featSlot({ featId: "weaponFocus", selectedWeaponId: "longsword" })],
    });
    expect(resolveFeatBonuses(character, featsById).weaponAttackBonuses).toEqual({ longsword: 1 });
  });
});
