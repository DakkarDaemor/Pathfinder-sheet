import { describe, expect, it } from "vitest";
import { calculateCarryingCapacity, encumberedSpeed, encumbrancePenaltyFor, resolveEncumbranceLevel } from "./encumbrance";

describe("calculateCarryingCapacity", () => {
  it("matches the Core Rulebook table for a medium creature", () => {
    expect(calculateCarryingCapacity(10).heavy).toBe(33);
    expect(calculateCarryingCapacity(18).heavy).toBe(100);
  });

  it("splits light/medium/heavy as 1/3 and 2/3 of the heavy load", () => {
    const cap = calculateCarryingCapacity(10);
    expect(cap.light).toBe(Math.floor(33 / 3));
    expect(cap.medium).toBe(Math.floor((33 * 2) / 3));
  });

  it("quadruples every +10 Strength above 20", () => {
    const at20 = calculateCarryingCapacity(20).heavy;
    const at30 = calculateCarryingCapacity(30).heavy;
    expect(at30).toBe(at20 * 4);
  });

  it("scales by size relative to Medium", () => {
    const medium = calculateCarryingCapacity(10, "medium").heavy;
    const large = calculateCarryingCapacity(10, "large").heavy;
    const small = calculateCarryingCapacity(10, "small").heavy;
    expect(large).toBe(medium * 4);
    expect(small).toBe(Math.floor(medium / 4));
  });
});

describe("resolveEncumbranceLevel", () => {
  it("buckets total weight into light/medium/heavy/overloaded", () => {
    const capacity = calculateCarryingCapacity(10); // light 11, medium 22, heavy 33
    expect(resolveEncumbranceLevel(10, capacity)).toBe("light");
    expect(resolveEncumbranceLevel(20, capacity)).toBe("medium");
    expect(resolveEncumbranceLevel(30, capacity)).toBe("heavy");
    expect(resolveEncumbranceLevel(40, capacity)).toBe("overloaded");
  });
});

describe("encumbrancePenaltyFor", () => {
  it("has no penalty while lightly loaded", () => {
    expect(encumbrancePenaltyFor("light")).toEqual({ maxDexBonus: null, checkPenalty: 0 });
  });

  it("matches medium/heavy armor's max Dex cap and check penalty", () => {
    expect(encumbrancePenaltyFor("medium")).toEqual({ maxDexBonus: 3, checkPenalty: -3 });
    expect(encumbrancePenaltyFor("heavy")).toEqual({ maxDexBonus: 1, checkPenalty: -6 });
  });
});

describe("encumberedSpeed", () => {
  it("leaves speed untouched under a light load", () => {
    expect(encumberedSpeed(30, "light")).toBe(30);
  });

  it("reduces known base speeds under a medium or heavy load", () => {
    expect(encumberedSpeed(30, "medium")).toBe(20);
    expect(encumberedSpeed(20, "heavy")).toBe(15);
  });

  it("leaves an unlisted base speed unchanged", () => {
    expect(encumberedSpeed(35, "heavy")).toBe(35);
  });
});
