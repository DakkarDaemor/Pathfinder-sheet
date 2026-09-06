import { describe, expect, it } from "vitest";
import { createDefaultAbilityScores } from "@/domain/shared/abilities";
import { createDefaultDefenseLoadout } from "@/domain/shared/creature";
import type { ClassDefinition, SkillDefinition } from "@/content/types";
import {
  deriveAttacks,
  deriveSkillTotals,
  resolveBaseAttackBonus,
  resolveBaseSaves,
  resolveEquipmentDefenseBonuses,
  skillPointsForLevel,
  type ClassLookup,
  type SkillLookup,
} from "./calculations";
import type { InventoryItem, PlayerCharacter } from "./types";

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
    hitPoints: { max: 1, current: 1, nonLethal: 0 },
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

    const [total] = deriveSkillTotals(character, classesById, skillsById);
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

    const [total] = deriveSkillTotals(character, classesById, skillsById);
    expect(total?.total).toBe(0 + 0 + 0 - 2);
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
    notes: "",
    ...overrides,
  };
}

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
});

describe("deriveAttacks", () => {
  it("derives attack bonus and damage from an equipped catalog weapon", () => {
    const character = baseCharacter({
      classLevels: [{ classId: "fighter", level: 3 }],
      abilityScores: { ...createDefaultAbilityScores(10), str: 16 },
      inventory: [inventoryItem({ id: "sword", equipmentId: "longsword", name: "Longsword", equipped: true })],
    });

    const [attack] = deriveAttacks(character, classesById);
    // BAB(fighter 3, full) 3 + strMod(16 -> +3) + sizeMod(medium 0) = 6
    expect(attack?.attackBonus).toBe(6);
    expect(attack?.damageDice).toBe("1d8");
    expect(attack?.damageBonus).toBe(3);
    expect(attack?.critRange).toBe("19-20");
  });

  it("skips equipped non-weapon and custom items", () => {
    const character = baseCharacter({
      inventory: [
        inventoryItem({ id: "armor", equipmentId: "studdedLeather", equipped: true }),
        inventoryItem({ id: "custom", equipmentId: null, name: "Homebrew blade", equipped: true }),
      ],
    });
    expect(deriveAttacks(character, classesById)).toEqual([]);
  });
});
