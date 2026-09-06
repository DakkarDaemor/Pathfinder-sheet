import { describe, expect, it } from "vitest";
import { createDefaultAbilityScores } from "@/domain/shared/abilities";
import { createDefaultDefenseLoadout } from "@/domain/shared/creature";
import type {
  ClassDefinition,
  FeatDefinition,
  RaceDefinition,
  SkillDefinition,
} from "@/content/types";
import type { FeatLookup } from "./featEffects";
import {
  deriveAttacks,
  deriveCombatSheet,
  deriveEffectiveAbilityScores,
  deriveExpectedFeatCount,
  deriveHitPointBreakdown,
  deriveHitPointsMax,
  deriveSkillPointBudget,
  deriveSkillTotals,
  resolveBaseAttackBonus,
  resolveBaseSaves,
  resolveEquipmentDefenseBonuses,
  skillPointsForLevel,
  type ClassLookup,
  type RaceLookup,
  type SkillLookup,
} from "./calculations";
import type { FeatSlot, InventoryItem, PlayerCharacter } from "./types";

const fighter: ClassDefinition = {
  id: "fighter",
  nameKey: "srd:class.fighter.name",
  hitDie: 10,
  babProgression: "full",
  saveProgressions: { fort: "good", ref: "poor", will: "poor" },
  skillPointsPerLevel: 2,
  classSkillIds: ["climb", "intimidate"],
  isSpellcaster: false,
  features: [],
};

const wizard: ClassDefinition = {
  id: "wizard",
  nameKey: "srd:class.wizard.name",
  hitDie: 6,
  babProgression: "half",
  saveProgressions: { fort: "poor", ref: "poor", will: "good" },
  skillPointsPerLevel: 2,
  classSkillIds: ["spellcraft", "knowledgeArcana"],
  isSpellcaster: true,
  spellcastingAbility: "int",
  features: [],
};

const classesById: ClassLookup = { fighter, wizard };

const climb: SkillDefinition = {
  id: "climb",
  nameKey: "srd:skill.climb.name",
  keyAbility: "str",
  trainedOnly: false,
  armorCheckPenalty: true,
};

const perception: SkillDefinition = {
  id: "perception",
  nameKey: "srd:skill.perception.name",
  keyAbility: "wis",
  trainedOnly: false,
  armorCheckPenalty: false,
};

const acrobatics: SkillDefinition = {
  id: "acrobatics",
  nameKey: "srd:skill.acrobatics.name",
  keyAbility: "dex",
  trainedOnly: false,
  armorCheckPenalty: true,
};

const craft: SkillDefinition = {
  id: "craft",
  nameKey: "srd:skill.craft.name",
  keyAbility: "int",
  trainedOnly: false,
  armorCheckPenalty: false,
};

const skillsById: SkillLookup = { climb, perception, acrobatics, craft };

const dwarf: RaceDefinition = {
  id: "dwarf",
  nameKey: "srd:race.dwarf",
  size: "medium",
  speed: 20,
  abilityAdjustments: { con: 2, wis: 2, cha: -2 },
  traits: [],
};

// Human's real racial effects (Skilled +1 skill point/level, Bonus Feat) are attached here since
// this fixture is the default race for baseCharacter() and neither effect touches saves/skill
// totals, so it's safe to keep as the shared default without perturbing unrelated tests.
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

const halfling: RaceDefinition = {
  id: "halfling",
  nameKey: "srd:race.halfling",
  size: "small",
  speed: 20,
  abilityAdjustments: { dex: 2, cha: 2, str: -2 },
  traits: [
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

const racesById: RaceLookup = { dwarf, human, halfling, gnome };

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

const featsById: FeatLookup = { skillFocus, weaponFocus };

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

describe("multiclass BAB/saves", () => {
  it("sums each class's own progression rather than using total level", () => {
    const character = baseCharacter({
      classLevels: [
        { classId: "fighter", level: 3 },
        { classId: "wizard", level: 2 },
      ],
    });

    // fighter(3) full = 3, wizard(2) half = 1 -> 4
    expect(resolveBaseAttackBonus(character, classesById)).toBe(4);

    const saves = resolveBaseSaves(character, classesById);
    // fort: fighter good(3)=3 + wizard poor(2)=0 -> 3
    expect(saves.fort).toBe(3);
    // will: fighter poor(3)=1 + wizard good(2)=3 -> 4
    expect(saves.will).toBe(4);
  });
});

describe("deriveSkillTotals", () => {
  it("adds the +3 class skill bonus only when ranks are invested", () => {
    const character = baseCharacter({
      classLevels: [{ classId: "fighter", level: 1 }],
      abilityScores: { ...createDefaultAbilityScores(10), str: 14 },
      skills: [{ skillId: "climb", ranks: 2, miscModifier: 0 }],
    });

    const [total] = deriveSkillTotals(character, classesById, skillsById, racesById, {});
    // ranks(2) + strMod(2) + classSkill(3) - armorCheckPenalty(0) = 7
    expect(total?.total).toBe(7);
    expect(total?.isClassSkill).toBe(true);
  });

  it("applies the armor check penalty when the skill is affected", () => {
    const character = baseCharacter({
      classLevels: [{ classId: "fighter", level: 1 }],
      defense: { ...createDefaultDefenseLoadout(), armorCheckPenalty: 2 },
      skills: [{ skillId: "climb", ranks: 0, miscModifier: 0 }],
    });

    const [total] = deriveSkillTotals(character, classesById, skillsById, racesById, {});
    expect(total?.total).toBe(0 + 0 + 0 - 2);
  });

  it("adds a Skill Focus bonus on top of everything else", () => {
    const character = baseCharacter({
      classLevels: [{ classId: "fighter", level: 1 }],
      abilityScores: { ...createDefaultAbilityScores(10), str: 14 },
      skills: [{ skillId: "climb", ranks: 2, miscModifier: 0 }],
      feats: [featSlot({ featId: "skillFocus", selectedSkillId: "climb" })],
    });

    const [total] = deriveSkillTotals(character, classesById, skillsById, racesById, featsById);
    // ranks(2) + strMod(2) + classSkill(3) + skillFocus(3) - armorCheckPenalty(0) = 10
    expect(total?.total).toBe(10);
  });

  it("adds an unconditional racial skill bonus even with zero ranks (Halfling Keen Senses)", () => {
    const character = baseCharacter({
      raceId: "halfling",
      skills: [{ skillId: "perception", ranks: 0, miscModifier: 0 }],
    });

    const [total] = deriveSkillTotals(character, classesById, skillsById, racesById, {});
    // wisMod(0) + keenSenses(2) = 2
    expect(total?.total).toBe(2);
  });

  it("adds a player-chosen racial skill bonus (Gnome Obsessive) only when a skill is picked", () => {
    const unpicked = baseCharacter({
      raceId: "gnome",
      skills: [{ skillId: "craft", ranks: 0, miscModifier: 0 }],
    });
    const [unpickedTotal] = deriveSkillTotals(unpicked, classesById, skillsById, racesById, {});
    expect(unpickedTotal?.total).toBe(0);

    const picked = baseCharacter({
      raceId: "gnome",
      floatingSkillChoice: "craft",
      skills: [{ skillId: "craft", ranks: 0, miscModifier: 0 }],
    });
    const [pickedTotal] = deriveSkillTotals(picked, classesById, skillsById, racesById, {});
    // intMod(0) + obsessive(2) = 2
    expect(pickedTotal?.total).toBe(2);
  });
});

describe("deriveCombatSheet racial saving throw bonuses", () => {
  it("adds an unconditional racial saving-throw bonus to all three saves (Halfling Luck)", () => {
    const character = baseCharacter({ raceId: "halfling" });
    const sheet = deriveCombatSheet(character, classesById, racesById, {});
    // effective dex = 10 - 2(str) + 2(dex) ... halfling: str-2, dex+2, cha+2 -> dexMod(12) = 1
    expect(sheet.savingThrows.fort).toBe(1); // conMod(0) + luck(1)
    expect(sheet.savingThrows.ref).toBe(2); // dexMod(1) + luck(1)
    expect(sheet.savingThrows.will).toBe(1); // wisMod(0) + luck(1)
  });
});

describe("skillPointsForLevel", () => {
  it("never drops below 1 even with a negative Int modifier", () => {
    expect(skillPointsForLevel(fighter, -4)).toBe(1);
  });

  it("adds the Int modifier to the class base", () => {
    expect(skillPointsForLevel(wizard, 3)).toBe(5);
  });
});

function inventoryItem(overrides: Partial<InventoryItem>): InventoryItem {
  return {
    id: "item-1",
    equipmentId: null,
    name: "",
    quantity: 1,
    weight: 0,
    equipped: false,
    customQualities: "",
    customWeapon: null,
    customArmor: null,
    notes: "",
    ...overrides,
  };
}

describe("deriveEffectiveAbilityScores", () => {
  it("applies fixed racial adjustments on top of the base score", () => {
    const character = baseCharacter({
      raceId: "dwarf",
      abilityScores: { ...createDefaultAbilityScores(10), con: 12 },
    });
    const effective = deriveEffectiveAbilityScores(character, racesById);
    expect(effective.con).toBe(14);
    expect(effective.wis).toBe(12);
    expect(effective.cha).toBe(8);
  });

  it("applies a floating racial bonus only when the player has picked an ability", () => {
    const unpicked = baseCharacter({ raceId: "human" });
    expect(deriveEffectiveAbilityScores(unpicked, racesById).str).toBe(10);

    const picked = baseCharacter({ raceId: "human", floatingAbilityChoice: "str" });
    expect(deriveEffectiveAbilityScores(picked, racesById).str).toBe(12);
  });

  it("leaves scores untouched when the race is unknown", () => {
    const character = baseCharacter({ raceId: "does-not-exist" });
    expect(deriveEffectiveAbilityScores(character, racesById)).toEqual(character.abilityScores);
  });
});

describe("deriveHitPointsMax", () => {
  it("takes the max hit die on the very first level and the average on every level after", () => {
    const character = baseCharacter({
      classLevels: [{ classId: "fighter", level: 3 }],
      abilityScores: { ...createDefaultAbilityScores(10), con: 14 },
    });
    // fighter d10: first level max(10) + 2 average levels (ceil(11/2)=6 each) = 22, + conMod(2)*3 = 6 -> 28
    expect(deriveHitPointsMax(character, classesById, character.abilityScores)).toBe(28);
  });

  it("only takes max hit die on the character's very first level across a multiclass", () => {
    const character = baseCharacter({
      classLevels: [
        { classId: "fighter", level: 1 },
        { classId: "wizard", level: 1 },
      ],
      abilityScores: createDefaultAbilityScores(10),
    });
    // fighter d10 first level max(10) + wizard d6 average(ceil(7/2)=4) = 14, + conMod(0) = 14
    expect(deriveHitPointsMax(character, classesById, character.abilityScores)).toBe(14);
  });

  it("lets a per-level roll override the very first (normally max) level", () => {
    const character = baseCharacter({
      classLevels: [{ classId: "fighter", level: 3, hpRolls: [4] }],
      abilityScores: { ...createDefaultAbilityScores(10), con: 14 },
    });
    // rolled 4 instead of max(10) on level 1, + 2 average levels (6 each) = 16, + conMod(2)*3 = 6 -> 22
    expect(deriveHitPointsMax(character, classesById, character.abilityScores)).toBe(22);
  });

  it("lets a per-level roll override a later (normally average) level, leaving others on default", () => {
    const character = baseCharacter({
      classLevels: [{ classId: "fighter", level: 3, hpRolls: [null, 8] }],
      abilityScores: { ...createDefaultAbilityScores(10), con: 14 },
    });
    // max(10) + rolled(8) + average(6) = 24, + conMod(2)*3 = 6 -> 30
    expect(deriveHitPointsMax(character, classesById, character.abilityScores)).toBe(30);
  });
});

describe("deriveHitPointBreakdown", () => {
  it("produces one row per level with the right default/override/total", () => {
    const character = baseCharacter({
      classLevels: [
        { classId: "fighter", level: 1 },
        { classId: "wizard", level: 1, hpRolls: [3] },
      ],
      abilityScores: { ...createDefaultAbilityScores(10), con: 12 },
    });

    const rows = deriveHitPointBreakdown(character, classesById, character.abilityScores);
    expect(rows).toHaveLength(2);

    expect(rows[0]).toMatchObject({
      classId: "fighter",
      isFirstOverall: true,
      defaultRoll: 10,
      override: null,
      rollUsed: 10,
      conMod: 1,
      total: 11,
    });
    // wizard d6 average would be ceil(7/2)=4, but overridden to 3
    expect(rows[1]).toMatchObject({
      classId: "wizard",
      isFirstOverall: false,
      defaultRoll: 4,
      override: 3,
      rollUsed: 3,
      conMod: 1,
      total: 4,
    });
  });
});

describe("deriveSkillPointBudget", () => {
  it("sums each class level's skill points (Core Rulebook min 1/level)", () => {
    const character = baseCharacter({
      raceId: "dwarf",
      classLevels: [{ classId: "fighter", level: 3 }],
      skills: [{ skillId: "climb", ranks: 4, miscModifier: 0 }],
    });
    // fighter: max(1, 2 + intMod(0)) = 2/level * 3 levels = 6, no racial bonus
    expect(
      deriveSkillPointBudget(character, classesById, racesById, character.abilityScores),
    ).toEqual({ available: 6, spent: 4 });
  });

  it("adds the racial extra skill points per level (Human Skilled)", () => {
    const character = baseCharacter({
      raceId: "human",
      classLevels: [{ classId: "fighter", level: 3 }],
      skills: [],
    });
    // base 6 (as above) + Skilled(1/level * 3 total levels) = 9
    expect(
      deriveSkillPointBudget(character, classesById, racesById, character.abilityScores).available,
    ).toBe(9);
  });
});

describe("deriveExpectedFeatCount", () => {
  it("is 0 with no levels", () => {
    expect(deriveExpectedFeatCount(baseCharacter({ classLevels: [] }), racesById)).toBe(0);
  });

  it("follows the 1-per-odd-level rule with no racial bonus", () => {
    const character = baseCharacter({
      raceId: "dwarf",
      classLevels: [{ classId: "fighter", level: 4 }],
    });
    expect(deriveExpectedFeatCount(character, racesById)).toBe(2);
  });

  it("adds a racial bonus feat slot (Human Bonus Feat)", () => {
    const character = baseCharacter({
      raceId: "human",
      classLevels: [{ classId: "fighter", level: 1 }],
    });
    expect(deriveExpectedFeatCount(character, racesById)).toBe(2);
  });
});

describe("resolveEquipmentDefenseBonuses", () => {
  it("ignores items that aren't equipped or aren't catalog armor", () => {
    const bonuses = resolveEquipmentDefenseBonuses([
      inventoryItem({ id: "a", equipmentId: "studdedLeather", equipped: false }),
      inventoryItem({ id: "b", equipmentId: null, equipped: true }),
    ]);
    expect(bonuses).toEqual({
      armorBonus: 0,
      shieldBonus: 0,
      armorCheckPenalty: 0,
      armorMaxDexBonus: null,
    });
  });

  it("combines an equipped armor and shield, flipping check penalty to a positive magnitude", () => {
    // studdedLeather: light, acBonus 3, maxDexBonus 5, checkPenalty -1
    // heavyWoodenShield: shield, acBonus 2, checkPenalty -2
    const bonuses = resolveEquipmentDefenseBonuses([
      inventoryItem({ id: "a", equipmentId: "studdedLeather", equipped: true }),
      inventoryItem({ id: "b", equipmentId: "heavyWoodenShield", equipped: true }),
    ]);
    expect(bonuses.armorBonus).toBe(3);
    expect(bonuses.shieldBonus).toBe(2);
    expect(bonuses.armorMaxDexBonus).toBe(5);
    expect(bonuses.armorCheckPenalty).toBe(3); // 1 + 2, stacked and positive
  });

  it("takes the best armor bonus rather than stacking two body armors", () => {
    // studdedLeather acBonus 3, chainmail acBonus 6 (medium)
    const bonuses = resolveEquipmentDefenseBonuses([
      inventoryItem({ id: "a", equipmentId: "studdedLeather", equipped: true }),
      inventoryItem({ id: "b", equipmentId: "chainmail", equipped: true }),
    ]);
    expect(bonuses.armorBonus).toBe(6);
    expect(bonuses.armorMaxDexBonus).toBe(2); // chainmail's own max Dex, since it won
  });

  it("gives a structured custom armor the same treatment as a catalog one", () => {
    const bonuses = resolveEquipmentDefenseBonuses([
      inventoryItem({
        id: "custom",
        equipmentId: null,
        equipped: true,
        customArmor: { category: "medium", acBonus: 5, maxDexBonus: 3, checkPenalty: -4 },
      }),
    ]);
    expect(bonuses.armorBonus).toBe(5);
    expect(bonuses.armorMaxDexBonus).toBe(3);
    expect(bonuses.armorCheckPenalty).toBe(4);
  });
});

describe("deriveAttacks", () => {
  it("derives attack bonus and damage from an equipped catalog weapon", () => {
    const character = baseCharacter({
      classLevels: [{ classId: "fighter", level: 3 }],
      abilityScores: { ...createDefaultAbilityScores(10), str: 16 },
      inventory: [
        inventoryItem({ id: "sword", equipmentId: "longsword", name: "Longsword", equipped: true }),
      ],
    });

    const [attack] = deriveAttacks(character, classesById, racesById, {});
    // BAB(fighter 3, full) 3 + strMod(16 -> +3) + sizeMod(medium 0) = 6
    expect(attack?.attackBonus).toBe(6);
    expect(attack?.damageDice).toBe("1d8");
    expect(attack?.damageBonus).toBe(3);
    expect(attack?.critRange).toBe("19-20");
  });

  it("skips equipped non-weapon and plain custom items", () => {
    const character = baseCharacter({
      inventory: [
        inventoryItem({ id: "armor", equipmentId: "studdedLeather", equipped: true }),
        inventoryItem({ id: "custom", equipmentId: null, name: "Homebrew blade", equipped: true }),
      ],
    });
    expect(deriveAttacks(character, classesById, racesById, {})).toEqual([]);
  });

  it("derives an attack from a structured custom weapon", () => {
    const character = baseCharacter({
      classLevels: [{ classId: "fighter", level: 1 }],
      abilityScores: { ...createDefaultAbilityScores(10), str: 14 },
      inventory: [
        inventoryItem({
          id: "custom",
          equipmentId: null,
          name: "Homebrew blade",
          equipped: true,
          customWeapon: {
            damage: "2d6",
            critRange: "18-20",
            critMultiplier: 3,
            damageTypes: "fire, slashing",
          },
        }),
      ],
    });
    const [attack] = deriveAttacks(character, classesById, racesById, {});
    expect(attack?.damageDice).toBe("2d6");
    expect(attack?.critMultiplier).toBe(3);
    expect(attack?.damageTypes).toEqual(["fire", "slashing"]);
    expect(attack?.customDamageTypes).toBe(true);
  });

  it("adds a Weapon Focus bonus only to the matching catalog weapon", () => {
    const character = baseCharacter({
      classLevels: [{ classId: "fighter", level: 3 }],
      abilityScores: { ...createDefaultAbilityScores(10), str: 16 },
      inventory: [
        inventoryItem({ id: "sword", equipmentId: "longsword", name: "Longsword", equipped: true }),
        inventoryItem({ id: "axe", equipmentId: "handaxe", name: "Handaxe", equipped: true }),
      ],
      feats: [featSlot({ featId: "weaponFocus", selectedWeaponId: "longsword" })],
    });

    const attacks = deriveAttacks(character, classesById, racesById, featsById);
    const sword = attacks.find((a) => a.inventoryItemId === "sword");
    const axe = attacks.find((a) => a.inventoryItemId === "axe");
    // base attack bonus 6 (see above) + weaponFocus(1) = 7 for the longsword only
    expect(sword?.attackBonus).toBe(7);
    expect(axe?.attackBonus).toBe(6);
  });
});
