import { describe, expect, it } from "vitest";
import { COMPANION_REGISTRY } from "./registry";

describe("animal-companion / mount progression", () => {
  it("uses three-quarters BAB, good Fort/Ref, poor Will", () => {
    const progression = COMPANION_REGISTRY["animal-companion"].computeProgression(8);
    expect(progression.baseAttackBonus).toBe(6); // floor(8*3/4)
    expect(progression.baseSaves).toEqual({ fort: 6, ref: 6, will: 2 });
  });

  it("grows natural armor every 3 levels and Str/Dex every 4", () => {
    const progression = COMPANION_REGISTRY["animal-companion"].computeProgression(9);
    expect(progression.naturalArmorAdjustment).toBe(3);
    expect(progression.abilityAdjustment).toEqual({ str: 2, dex: 2 });
  });
});

describe("familiar progression", () => {
  it("falls back to its own weak baseline with no master given", () => {
    const progression = COMPANION_REGISTRY.familiar.computeProgression(5);
    expect(progression.baseAttackBonus).toBe(2); // floor(5/2)
    expect(progression.baseSaves.will).toBe(4); // good will: 2 + floor(5/2)
  });

  it("takes the better of its own or the master's numbers, per save", () => {
    const progression = COMPANION_REGISTRY.familiar.computeProgression(5, {
      baseAttackBonus: 2,
      baseSaves: { fort: 1, ref: 1, will: 4 },
    });
    // own fort/ref (poor@5=1) tie with master's 1 -> stays 1; own will (good@5=4) ties master's 4
    expect(progression.baseSaves).toEqual({ fort: 1, ref: 1, will: 4 });
  });
});
