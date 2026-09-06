import type { BaseSaves } from "@/domain/shared/creature";
import type { FeatDefinition } from "@/content/types";
import { totalCharacterLevel } from "./types";
import type { PlayerCharacter } from "./types";

export type FeatLookup = Record<string, FeatDefinition | undefined>;

export interface FeatBonuses {
  savingThrows: Partial<BaseSaves>;
  initiative: number;
  dodgeAc: number;
  hitPoints: number;
  skillBonuses: Record<string, number>;
  weaponAttackBonuses: Record<string, number>; // keyed by content/equipment.ts weapon id
}

function emptyFeatBonuses(): FeatBonuses {
  return { savingThrows: {}, initiative: 0, dodgeAc: 0, hitPoints: 0, skillBonuses: {}, weaponAttackBonuses: {} };
}

/**
 * Folds every feat with a structured `effect` into a flat set of bonuses the rest of the
 * calculations can add in. Only a handful of feats (flat, unconditional bonuses) have an effect —
 * most feats stay purely descriptive, same as before this existed.
 */
export function resolveFeatBonuses(character: PlayerCharacter, featsById: FeatLookup): FeatBonuses {
  const bonuses = emptyFeatBonuses();

  for (const slot of character.feats) {
    if (!slot.featId) continue;
    const effect = featsById[slot.featId]?.effect;
    if (!effect) continue;

    switch (effect.kind) {
      case "savingThrow":
        bonuses.savingThrows[effect.save] = (bonuses.savingThrows[effect.save] ?? 0) + effect.bonus;
        break;
      case "initiative":
        bonuses.initiative += effect.bonus;
        break;
      case "dodgeAc":
        bonuses.dodgeAc += effect.bonus;
        break;
      case "hitPoints": {
        // Toughness: +3 hit points; for every Hit Die beyond the 3rd, the bonus instead equals the HD count.
        const level = totalCharacterLevel(character);
        if (level > 0) bonuses.hitPoints += Math.max(3, level);
        break;
      }
      case "skillFocus": {
        if (!slot.selectedSkillId) break;
        const ranks = character.skills.find((s) => s.skillId === slot.selectedSkillId)?.ranks ?? 0;
        const bonus = ranks >= 10 ? effect.bonusAtTenRanks : effect.bonus;
        bonuses.skillBonuses[slot.selectedSkillId] = (bonuses.skillBonuses[slot.selectedSkillId] ?? 0) + bonus;
        break;
      }
      case "weaponAttackBonus": {
        if (!slot.selectedWeaponId) break;
        bonuses.weaponAttackBonuses[slot.selectedWeaponId] = (bonuses.weaponAttackBonuses[slot.selectedWeaponId] ?? 0) + effect.bonus;
        break;
      }
    }
  }

  return bonuses;
}
