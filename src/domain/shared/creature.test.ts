import { describe, expect, it } from "vitest";
import { createDefaultAbilityScores } from "./abilities";
import {
  calculateArmorClass,
  calculateCombatManeuvers,
  calculateInitiative,
  calculateSavingThrows,
  createDefaultDefenseLoadout,
  type CreatureCombatProfile,
} from "./creature";

function baseProfile(overrides: Partial<CreatureCombatProfile> = {}): CreatureCombatProfile {
  return {
    size: "medium",
    abilityScores: createDefaultAbilityScores(10),
    baseAttackBonus: 0,
    baseSaves: { fort: 0, ref: 0, will: 0 },
    defense: createDefaultDefenseLoadout(),
    ...overrides,
  };
}

describe("calculateArmorClass", () => {
  it("is 10 for a bare medium creature with no modifiers", () => {
    const ac = calculateArmorClass(baseProfile());
    expect(ac).toEqual({ normal: 10, touch: 10, flatFooted: 10 });
  });

  it("adds dex, armor, shield and size, and caps dex with armor max dex", () => {
    const profile = baseProfile({
      size: "small",
      abilityScores: { ...createDefaultAbilityScores(10), dex: 20 }, // +5 dex mod
      defense: { ...createDefaultDefenseLoadout(), armorBonus: 4, shieldBonus: 2, armorMaxDexBonus: 2 },
    });
    const ac = calculateArmorClass(profile);
    // 10 + armor 4 + shield 2 + dex(capped 2) + size(+1 small) = 19
    expect(ac.normal).toBe(19);
    // touch ignores armor/shield: 10 + dex(capped 2) + size 1 = 13
    expect(ac.touch).toBe(13);
    // flat-footed loses dex: 19 - 2 = 17
    expect(ac.flatFooted).toBe(17);
  });
});

describe("calculateSavingThrows", () => {
  it("adds ability modifiers to the resolved base saves", () => {
    const profile = baseProfile({
      abilityScores: { ...createDefaultAbilityScores(10), con: 16, dex: 14, wis: 8 },
      baseSaves: { fort: 5, ref: 2, will: 1 },
    });
    const saves = calculateSavingThrows(profile);
    expect(saves).toEqual({ fort: 5 + 3, ref: 2 + 2, will: 1 - 1 });
  });
});

describe("calculateInitiative", () => {
  it("uses the dex modifier plus misc", () => {
    const profile = baseProfile({
      abilityScores: { ...createDefaultAbilityScores(10), dex: 18 },
      miscInitiative: 4, // e.g. Improved Initiative
    });
    expect(calculateInitiative(profile)).toBe(4 + 4);
  });
});

describe("calculateCombatManeuvers", () => {
  it("computes CMB/CMD with size modifiers mirrored from AC", () => {
    const profile = baseProfile({
      size: "large",
      abilityScores: { ...createDefaultAbilityScores(10), str: 20, dex: 12 },
      baseAttackBonus: 5,
    });
    const { cmb, cmd } = calculateCombatManeuvers(profile);
    // cmb = bab(5) + strMod(5) + sizeMod(large=+1) = 11
    expect(cmb).toBe(11);
    // cmd = 10 + bab(5) + strMod(5) + dexMod(1) + sizeMod(1) = 22
    expect(cmd).toBe(22);
  });
});
