import type { SpellDefinition } from "./types";

function spell(id: string, school: string, levelsByClass: Record<string, number>): SpellDefinition {
  return { id, nameKey: `srd:spell.${id}.name`, descriptionKey: `srd:spell.${id}.description`, school, levelsByClass };
}

/**
 * Starter spell list: cantrips/orisons (level 0) and 1st-level spells for the base casters
 * (wizard, sorcerer, cleric, druid, bard, paladin, ranger). Meant to grow over time — see
 * the scope note in the project plan.
 */
export const SPELLS: SpellDefinition[] = [
  spell("detectMagic", "divination", { wizard: 0, sorcerer: 0, cleric: 0, druid: 0, bard: 0 }),
  spell("light", "evocation", { wizard: 0, sorcerer: 0, cleric: 0, druid: 0, bard: 0 }),
  spell("readMagic", "divination", { wizard: 0, sorcerer: 0, cleric: 0, druid: 0, bard: 0 }),
  spell("prestidigitation", "universal", { wizard: 0, sorcerer: 0, bard: 0 }),
  spell("rayOfFrost", "evocation", { wizard: 0, sorcerer: 0 }),
  spell("acidSplash", "conjuration", { wizard: 0, sorcerer: 0 }),
  spell("message", "transmutation", { wizard: 0, sorcerer: 0, bard: 0 }),
  spell("dancingLights", "evocation", { wizard: 0, sorcerer: 0, bard: 0, druid: 0 }),
  spell("mending", "transmutation", { wizard: 0, sorcerer: 0, cleric: 0, druid: 0, bard: 0 }),
  spell("stabilize", "conjuration", { cleric: 0, druid: 0 }),
  spell("guidance", "divination", { cleric: 0, druid: 0 }),
  spell("resistance", "abjuration", { wizard: 0, sorcerer: 0, cleric: 0, druid: 0, bard: 0 }),

  spell("magicMissile", "evocation", { wizard: 1, sorcerer: 1 }),
  spell("mageArmor", "conjuration", { wizard: 1, sorcerer: 1 }),
  spell("shield", "abjuration", { wizard: 1, sorcerer: 1 }),
  spell("charmPerson", "enchantment", { wizard: 1, sorcerer: 1, bard: 1 }),
  spell("sleep", "enchantment", { wizard: 1, sorcerer: 1 }),
  spell("grease", "conjuration", { wizard: 1, sorcerer: 1 }),
  spell("silentImage", "illusion", { wizard: 1, sorcerer: 1, bard: 1 }),
  spell("summonMonsterI", "conjuration", { wizard: 1, sorcerer: 1, cleric: 1, bard: 1 }),
  spell("protectionFromEvil", "abjuration", { wizard: 1, sorcerer: 1, cleric: 1, paladin: 1 }),
  spell("obscuringMist", "conjuration", { wizard: 1, sorcerer: 1, druid: 1 }),
  spell("longstrider", "transmutation", { wizard: 1, sorcerer: 1, druid: 1, ranger: 1 }),
  spell("jump", "transmutation", { druid: 1, ranger: 1 }),

  spell("cureLightWounds", "conjuration", { cleric: 1, druid: 1, paladin: 1, ranger: 1 }),
  spell("bless", "enchantment", { cleric: 1, paladin: 1 }),
  spell("shieldOfFaith", "abjuration", { cleric: 1, paladin: 1 }),
  spell("command", "enchantment", { cleric: 1 }),
  spell("doom", "necromancy", { cleric: 1 }),

  spell("entangle", "transmutation", { druid: 1, ranger: 1 }),
  spell("faerieFire", "evocation", { druid: 1 }),
];

export const SPELLS_BY_ID: Record<string, SpellDefinition> = Object.fromEntries(SPELLS.map((s) => [s.id, s]));

export function spellsForClass(classId: string): SpellDefinition[] {
  return SPELLS.filter((s) => classId in s.levelsByClass);
}
