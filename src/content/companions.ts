import type { CompanionBaseDefinition } from "./types";

/**
 * Starter base creatures for each companion kind (Open Game Content, Bestiary). These are the
 * 1st-level base ability scores/attacks *before* the companion progression bonuses in
 * `domain/companion/registry.ts` are applied — treat exact numbers as a reference to double
 * check against the book, not a tournament-legal source.
 */
export const COMPANION_BASES: CompanionBaseDefinition[] = [
  {
    id: "wolf",
    kind: "animal-companion",
    nameKey: "srd:companionBase.wolf",
    size: "medium",
    baseAbilityScores: { str: 13, dex: 15, con: 13, int: 2, wis: 12, cha: 6 },
    naturalAttacksKey: "srd:companionAttack.wolf",
    speed: 50,
    specialQualitiesKey: "srd:companionQuality.wolfTrip",
  },
  {
    id: "dog",
    kind: "animal-companion",
    nameKey: "srd:companionBase.dog",
    size: "medium",
    baseAbilityScores: { str: 13, dex: 15, con: 15, int: 2, wis: 12, cha: 6 },
    naturalAttacksKey: "srd:companionAttack.dog",
    speed: 40,
    specialQualitiesKey: null,
  },
  {
    id: "cat",
    kind: "animal-companion",
    nameKey: "srd:companionBase.cat",
    size: "small",
    baseAbilityScores: { str: 3, dex: 17, con: 10, int: 2, wis: 12, cha: 7 },
    naturalAttacksKey: "srd:companionAttack.cat",
    speed: 30,
    specialQualitiesKey: null,
  },
  {
    id: "eagle",
    kind: "animal-companion",
    nameKey: "srd:companionBase.eagle",
    size: "small",
    baseAbilityScores: { str: 8, dex: 15, con: 10, int: 2, wis: 14, cha: 6 },
    naturalAttacksKey: "srd:companionAttack.eagle",
    speed: 10,
    specialQualitiesKey: "srd:companionQuality.flyGood",
  },

  {
    id: "lightHorse",
    kind: "mount",
    nameKey: "srd:companionBase.lightHorse",
    size: "large",
    baseAbilityScores: { str: 16, dex: 13, con: 15, int: 2, wis: 13, cha: 6 },
    naturalAttacksKey: "srd:companionAttack.horse",
    speed: 60,
    specialQualitiesKey: null,
  },
  {
    id: "pony",
    kind: "mount",
    nameKey: "srd:companionBase.pony",
    size: "medium",
    baseAbilityScores: { str: 13, dex: 13, con: 13, int: 2, wis: 13, cha: 6 },
    naturalAttacksKey: "srd:companionAttack.horse",
    speed: 40,
    specialQualitiesKey: null,
  },

  {
    id: "cat_familiar",
    kind: "familiar",
    nameKey: "srd:companionBase.cat",
    size: "tiny",
    baseAbilityScores: { str: 3, dex: 17, con: 10, int: 6, wis: 12, cha: 7 },
    naturalAttacksKey: "srd:companionAttack.catFamiliar",
    speed: 30,
    specialQualitiesKey: "srd:companionQuality.grantsStealth",
  },
  {
    id: "raven",
    kind: "familiar",
    nameKey: "srd:companionBase.raven",
    size: "tiny",
    baseAbilityScores: { str: 2, dex: 15, con: 10, int: 6, wis: 14, cha: 7 },
    naturalAttacksKey: "srd:companionAttack.raven",
    speed: 10,
    specialQualitiesKey: "srd:companionQuality.grantsAppraise",
  },
  {
    id: "owl",
    kind: "familiar",
    nameKey: "srd:companionBase.owl",
    size: "tiny",
    baseAbilityScores: { str: 4, dex: 17, con: 10, int: 6, wis: 15, cha: 6 },
    naturalAttacksKey: "srd:companionAttack.owl",
    speed: 10,
    specialQualitiesKey: "srd:companionQuality.grantsPerceptionDark",
  },
  {
    id: "toad",
    kind: "familiar",
    nameKey: "srd:companionBase.toad",
    size: "tiny",
    baseAbilityScores: { str: 1, dex: 12, con: 10, int: 6, wis: 15, cha: 4 },
    naturalAttacksKey: "srd:companionAttack.toad",
    speed: 5,
    specialQualitiesKey: "srd:companionQuality.grantsMaxHp",
  },
  {
    id: "rat",
    kind: "familiar",
    nameKey: "srd:companionBase.rat",
    size: "tiny",
    baseAbilityScores: { str: 2, dex: 15, con: 11, int: 6, wis: 12, cha: 2 },
    naturalAttacksKey: "srd:companionAttack.rat",
    speed: 15,
    specialQualitiesKey: "srd:companionQuality.grantsFortitude",
  },
  {
    id: "bat",
    kind: "familiar",
    nameKey: "srd:companionBase.bat",
    size: "diminutive",
    baseAbilityScores: { str: 1, dex: 15, con: 10, int: 6, wis: 14, cha: 6 },
    naturalAttacksKey: "srd:companionAttack.bat",
    speed: 5,
    specialQualitiesKey: "srd:companionQuality.grantsBlindsense",
  },
];

export const COMPANION_BASES_BY_ID: Record<string, CompanionBaseDefinition> = Object.fromEntries(
  COMPANION_BASES.map((c) => [c.id, c]),
);

export function companionBasesForKind(kind: CompanionBaseDefinition["kind"]): CompanionBaseDefinition[] {
  return COMPANION_BASES.filter((c) => c.kind === kind);
}
