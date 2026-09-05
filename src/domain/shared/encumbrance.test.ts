import { describe, expect, it } from "vitest";
import { calculateCarryingCapacity } from "./encumbrance";

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
