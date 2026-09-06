import { z } from "zod";
import { ABILITY_NAMES } from "@/domain/shared/abilities";
import { SIZE_CATEGORIES } from "@/domain/shared/size";
import { FEAT_TYPES } from "@/content/types";

const abilityScoresSchema = z.object(
  Object.fromEntries(ABILITY_NAMES.map((name) => [name, z.number()])) as Record<
    (typeof ABILITY_NAMES)[number],
    z.ZodNumber
  >,
);

const sizeCategorySchema = z.enum(SIZE_CATEGORIES);
const abilityNameSchema = z.enum(ABILITY_NAMES);

const hitPointsSchema = z.object({
  max: z.number(),
  current: z.number(),
  nonLethal: z.number(),
  // Missing on save files predating HP automation: default to false so existing manually-entered
  // HP values are never silently overridden by the computed value on load.
  autoMax: z.boolean().default(false),
});

const armorCategorySchema = z.enum(["light", "medium", "heavy", "shield"]);

const customWeaponStatsSchema = z.object({
  damage: z.string(),
  critRange: z.string(),
  critMultiplier: z.number(),
  damageTypes: z.string(),
});

const customArmorStatsSchema = z.object({
  category: armorCategorySchema,
  acBonus: z.number(),
  maxDexBonus: z.number().nullable(),
  checkPenalty: z.number(),
});

const defenseLoadoutSchema = z.object({
  armorBonus: z.number(),
  armorMaxDexBonus: z.number().nullable(),
  armorCheckPenalty: z.number(),
  shieldBonus: z.number(),
  naturalArmor: z.number(),
  deflection: z.number(),
  dodge: z.number(),
  miscAc: z.number(),
});

const companionKindSchema = z.enum(["animal-companion", "familiar", "mount"]);

const featTypeSchema = z.enum(FEAT_TYPES);

const companionCustomBaseSchema = z.object({
  name: z.string(),
  size: sizeCategorySchema,
  baseAbilityScores: abilityScoresSchema,
  naturalAttacks: z.string(),
  speed: z.number(),
  specialQualities: z.string(),
});

const characterSchema = z.object({
  id: z.string(),
  schemaVersion: z.literal(1),
  name: z.string(),
  playerName: z.string(),
  raceId: z.string(),
  alignment: z.string(),
  deity: z.string(),
  size: sizeCategorySchema,
  classLevels: z.array(z.object({ classId: z.string(), level: z.number() })),
  abilityScores: abilityScoresSchema,
  floatingAbilityChoice: abilityNameSchema.nullable().default(null),
  hitPoints: hitPointsSchema,
  defense: defenseLoadoutSchema,
  skills: z.array(
    z.object({
      skillId: z.string(),
      ranks: z.number(),
      classSkillOverride: z.boolean().optional(),
      miscModifier: z.number(),
    }),
  ),
  feats: z.array(
    z.object({
      id: z.string(),
      featId: z.string().nullable(),
      customName: z.string(),
      customDescription: z.string(),
      customType: featTypeSchema,
      selectedSkillId: z.string().nullable().default(null),
      selectedWeaponId: z.string().nullable().default(null),
      notes: z.string(),
    }),
  ),
  traits: z.array(z.string()),
  inventory: z.array(
    z.object({
      id: z.string(),
      equipmentId: z.string().nullable(),
      name: z.string(),
      quantity: z.number(),
      weight: z.number(),
      equipped: z.boolean(),
      customQualities: z.string(),
      customWeapon: customWeaponStatsSchema.nullable().default(null),
      customArmor: customArmorStatsSchema.nullable().default(null),
      notes: z.string(),
    }),
  ),
  spells: z.array(
    z.object({
      id: z.string(),
      spellId: z.string().nullable(),
      customName: z.string(),
      customDescription: z.string(),
      customSchool: z.string(),
      customLevel: z.number(),
      customSpellcastingClassId: z.string().nullable().default(null),
      prepared: z.boolean(),
    }),
  ),
  companions: z.array(z.object({ companionId: z.string(), kind: companionKindSchema })),
  notes: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const companionSchema = z.object({
  id: z.string(),
  schemaVersion: z.literal(1),
  kind: companionKindSchema,
  baseId: z.string().nullable(),
  customBase: companionCustomBaseSchema.nullable(),
  name: z.string(),
  masterCharacterId: z.string(),
  abilityScoreOverrides: abilityScoresSchema.partial(),
  hitPoints: hitPointsSchema,
  defense: defenseLoadoutSchema,
  tricksOrTraits: z.array(z.string()),
  notes: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Portable save-file envelope: one character plus the companions linked to it. */
export const characterSaveFileSchema = z.object({
  schemaVersion: z.literal(1),
  kind: z.literal("pf1-character-save"),
  exportedAt: z.string(),
  character: characterSchema,
  companions: z.array(companionSchema),
});

export type CharacterSaveFile = z.infer<typeof characterSaveFileSchema>;

/** Whole-roster snapshot used for the localStorage autosave. */
export const rosterSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  characters: z.array(characterSchema),
  companions: z.array(companionSchema),
});

export type RosterSnapshot = z.infer<typeof rosterSnapshotSchema>;
