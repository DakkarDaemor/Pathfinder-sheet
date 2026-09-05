import { describe, expect, it } from "vitest";
import { createDefaultAbilityScores } from "@/domain/shared/abilities";
import { resolveCompanionBaseStats } from "./calculations";
import type { Companion } from "./types";

function makeCompanion(overrides: Partial<Companion>): Companion {
  const now = new Date().toISOString();
  return {
    id: "companion-1",
    schemaVersion: 1,
    kind: "animal-companion",
    baseId: "wolf",
    customBase: null,
    name: "Fang",
    masterCharacterId: "character-1",
    abilityScoreOverrides: {},
    hitPoints: { max: 0, current: 0, nonLethal: 0 },
    defense: {
      armorBonus: 0,
      armorMaxDexBonus: null,
      armorCheckPenalty: 0,
      shieldBonus: 0,
      naturalArmor: 0,
      deflection: 0,
      dodge: 0,
      miscAc: 0,
    },
    tricksOrTraits: [],
    notes: "",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("resolveCompanionBaseStats", () => {
  it("resolves stats from the built-in catalog when baseId is set", () => {
    const stats = resolveCompanionBaseStats(makeCompanion({}));
    expect(stats).toEqual({ size: "medium", baseAbilityScores: { str: 13, dex: 15, con: 13, int: 2, wis: 12, cha: 6 } });
  });

  it("resolves stats from the companion's own custom base when baseId is null", () => {
    const customAbilityScores = createDefaultAbilityScores(11);
    const stats = resolveCompanionBaseStats(
      makeCompanion({
        baseId: null,
        customBase: {
          name: "Homebrew Beast",
          size: "large",
          baseAbilityScores: customAbilityScores,
          naturalAttacks: "bite",
          speed: 40,
          specialQualities: "",
        },
      }),
    );
    expect(stats).toEqual({ size: "large", baseAbilityScores: customAbilityScores });
  });

  it("returns null when neither a valid baseId nor a custom base is present", () => {
    expect(resolveCompanionBaseStats(makeCompanion({ baseId: null, customBase: null }))).toBeNull();
  });
});
