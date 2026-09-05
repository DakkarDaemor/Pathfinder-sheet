import { z } from "zod";
import { ABILITY_NAMES } from "@/domain/shared/abilities";
import { SIZE_CATEGORIES } from "@/domain/shared/size";

const abilityScoresSchema = z.object(
  Object.fromEntries(ABILITY_NAMES.map((name) => [name, z.number()])) as Record<
    (typeof ABILITY_NAMES)[number],
    z.ZodNumber
  >,
);

const sizeCategorySchema = z.enum(SIZE_CATEGORIES);

const hitPointsSchema = z.object({
  max: z.number(),
  current: z.number(),
  nonLethal: z.number(),
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
  feats: z.array(z.object({ id: z.string(), featId: z.string(), notes: z.string() })),
  traits: z.array(z.string()),
  inventory: z.array(
    z.object({
      id: z.string(),
      equipmentId: z.string().nullable(),
      name: z.string(),
      quantity: z.number(),
      weight: z.number(),
      equipped: z.boolean(),
      notes: z.string(),
    }),
  ),
  spells: z.array(z.object({ id: z.string(), spellId: z.string(), prepared: z.boolean() })),
  companions: z.array(z.object({ companionId: z.string(), kind: companionKindSchema })),
  notes: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const companionSchema = z.object({
  id: z.string(),
  schemaVersion: z.literal(1),
  kind: companionKindSchema,
  baseId: z.string(),
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
