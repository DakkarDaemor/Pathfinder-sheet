import { describe, expect, it } from "vitest";
import { baseAttackBonus, baseSaveBonus } from "./progressions";

describe("baseAttackBonus", () => {
  it("full progression matches level 1:1", () => {
    expect(baseAttackBonus("full", 1)).toBe(1);
    expect(baseAttackBonus("full", 20)).toBe(20);
  });

  it("three-quarters progression rounds down", () => {
    expect(baseAttackBonus("three-quarters", 4)).toBe(3);
    expect(baseAttackBonus("three-quarters", 20)).toBe(15);
  });

  it("half progression rounds down", () => {
    expect(baseAttackBonus("half", 1)).toBe(0);
    expect(baseAttackBonus("half", 20)).toBe(10);
  });

  it("is 0 at level 0", () => {
    expect(baseAttackBonus("full", 0)).toBe(0);
  });
});

describe("baseSaveBonus", () => {
  it("good progression at level 1 is +2", () => {
    expect(baseSaveBonus("good", 1)).toBe(2);
  });

  it("good progression at level 20 is +12", () => {
    expect(baseSaveBonus("good", 20)).toBe(12);
  });

  it("poor progression at level 1 is +0", () => {
    expect(baseSaveBonus("poor", 1)).toBe(0);
  });

  it("poor progression at level 20 is +6", () => {
    expect(baseSaveBonus("poor", 20)).toBe(6);
  });
});
