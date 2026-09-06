import { describe, expect, it } from "vitest";
import { createDefaultAbilityScores } from "@/domain/shared/abilities";
import { createDefaultDefenseLoadout } from "@/domain/shared/creature";
import type { ClassDefinition, FeatDefinition, RaceDefinition, SkillDefinition } from "@/content/types";
import type { FeatLookup } from "./featEffects";
import {
  deriveAttacks,
  deriveEffectiveAbilityScores,
  deriveHitPointsMax,
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

const skillsById: SkillLookup = { climb };

const dwarf: RaceDefinition = {
  id: "dwarf",
  nameKey: "srd:race.dwarf",
  size: "medium",
  speed: 20,
  abilityAdjustments: { con: 2, wis: 2, cha: -2 },
  traitKeys: [],
};

const human: RaceDefinition = {
  id: "human",
  nameKey: "srd:race.human",
  size: "medium",
  speed: 30,
  abilityAdjustments: {},
  floatingAbilityBonus: 2,
  traitKeys: [],
};

const racesById: RaceLookup = { dwarf, human };

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
    const character = baseCharacter({ raceId: "dwarf", abilityScores: { ...createDefaultAbilityScores(10), con: 12 } });
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
});

describe("resolveEquipmentDefenseBonuses", () => {
  it("ignores items that aren't equipped or aren't catalog armor", () => {
    const bonuses = resolveEquipmentDefenseBonuses([
      inventoryItem({ id: "a", equipmentId: "studdedLeather", equipped: false }),
      inventoryItem({ id: "b", equipmentId: null, equipped: true }),
    ]);
    expect(bonuses).toEqual({ armorBonus: 0, shieldBonus: 0, armorCheckPenalty: 0, armorMaxDexBonus: null });
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
      inventory: [inventoryItem({ id: "sword", equipmentId: "longsword", name: "Longsword", equipped: true })],
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
          customWeapon: { damage: "2d6", critRange: "18-20", critMultiplier: 3, damageTypes: "fire, slashing" },
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
