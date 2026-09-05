import type { ArmorDefinition, GearDefinition, WeaponDefinition } from "./types";

function weapon(
  id: string,
  category: WeaponDefinition["category"],
  damage: string,
  critRange: string,
  critMultiplier: number,
  damageTypes: string[],
  weight: number,
  costGp: number,
): WeaponDefinition {
  return { id, nameKey: `srd:weapon.${id}`, category, damage, critRange, critMultiplier, damageTypes, weight, costGp };
}

/** Common Core Rulebook weapons (Open Game Content) — a starter set, easy to extend. */
export const WEAPONS: WeaponDefinition[] = [
  weapon("dagger", "simple", "1d4", "19-20", 2, ["piercing", "slashing"], 1, 2),
  weapon("club", "simple", "1d6", "20", 2, ["bludgeoning"], 3, 0),
  weapon("quarterstaff", "simple", "1d6/1d6", "20", 2, ["bludgeoning"], 4, 0),
  weapon("sling", "simple", "1d4", "20", 2, ["bludgeoning"], 0, 0),
  weapon("lightMace", "simple", "1d6", "20", 2, ["bludgeoning"], 4, 5),
  weapon("heavyMace", "simple", "1d8", "20", 2, ["bludgeoning"], 8, 12),
  weapon("spear", "simple", "1d8", "20", 3, ["piercing"], 6, 2),

  weapon("longsword", "martial", "1d8", "19-20", 2, ["slashing"], 4, 15),
  weapon("battleaxe", "martial", "1d8", "20", 3, ["slashing"], 6, 10),
  weapon("warhammer", "martial", "1d8", "20", 3, ["bludgeoning"], 8, 12),
  weapon("rapier", "martial", "1d6", "18-20", 2, ["piercing"], 2, 20),
  weapon("shortsword", "martial", "1d6", "19-20", 2, ["piercing"], 2, 10),
  weapon("greatsword", "martial", "2d6", "19-20", 2, ["slashing"], 8, 50),
  weapon("greataxe", "martial", "1d12", "20", 3, ["slashing"], 12, 20),
  weapon("handaxe", "martial", "1d6", "20", 3, ["slashing"], 3, 6),
  weapon("scimitar", "martial", "1d6", "18-20", 2, ["slashing"], 4, 15),
  weapon("longbow", "martial", "1d8", "20", 3, ["piercing"], 3, 75),
  weapon("shortbow", "martial", "1d6", "20", 3, ["piercing"], 2, 30),
  weapon("heavyCrossbow", "martial", "1d10", "19-20", 2, ["piercing"], 8, 50),
  weapon("lightCrossbow", "martial", "1d8", "19-20", 2, ["piercing"], 4, 35),

  weapon("bastardSword", "exotic", "1d10", "19-20", 2, ["slashing"], 6, 35),
  weapon("kukri", "exotic", "1d4", "18-20", 2, ["slashing"], 2, 8),
  weapon("spikedChain", "exotic", "2d4", "20", 2, ["piercing"], 10, 25),
  weapon("whip", "exotic", "1d3", "20", 2, ["slashing"], 2, 1),
];

export const WEAPONS_BY_ID: Record<string, WeaponDefinition> = Object.fromEntries(WEAPONS.map((w) => [w.id, w]));

function armor(
  id: string,
  category: ArmorDefinition["category"],
  acBonus: number,
  maxDexBonus: number | null,
  checkPenalty: number,
  spellFailurePercent: number,
  weight: number,
  costGp: number,
): ArmorDefinition {
  return {
    id,
    nameKey: `srd:armor.${id}`,
    category,
    acBonus,
    maxDexBonus,
    checkPenalty,
    spellFailurePercent,
    weight,
    costGp,
  };
}

/** Common Core Rulebook armors and shields (Open Game Content). */
export const ARMORS: ArmorDefinition[] = [
  armor("padded", "light", 1, 8, 0, 5, 10, 5),
  armor("leather", "light", 2, 6, 0, 10, 15, 10),
  armor("studdedLeather", "light", 3, 5, -1, 15, 20, 25),
  armor("chainShirt", "light", 4, 4, -2, 20, 25, 100),

  armor("hide", "medium", 4, 4, -3, 20, 25, 15),
  armor("scaleMail", "medium", 5, 3, -4, 25, 30, 50),
  armor("chainmail", "medium", 6, 2, -5, 30, 40, 150),
  armor("breastplate", "medium", 6, 3, -4, 25, 30, 200),

  armor("bandedMail", "heavy", 7, 1, -6, 35, 35, 250),
  armor("halfPlate", "heavy", 8, 0, -7, 40, 50, 600),
  armor("fullPlate", "heavy", 9, 1, -6, 35, 50, 1500),

  armor("buckler", "shield", 1, null, -1, 5, 5, 5),
  armor("lightWoodenShield", "shield", 1, null, -1, 5, 5, 3),
  armor("heavyWoodenShield", "shield", 2, null, -2, 15, 10, 7),
  armor("lightSteelShield", "shield", 1, null, -1, 5, 6, 9),
  armor("heavySteelShield", "shield", 2, null, -2, 15, 15, 20),
  armor("towerShield", "shield", 4, null, -10, 50, 45, 30),
];

export const ARMORS_BY_ID: Record<string, ArmorDefinition> = Object.fromEntries(ARMORS.map((a) => [a.id, a]));

function gear(id: string, weight: number, costGp: number): GearDefinition {
  return { id, nameKey: `srd:gear.${id}`, weight, costGp };
}

/** Common adventuring gear (Open Game Content) — a starter set. */
export const GEAR: GearDefinition[] = [
  gear("backpack", 2, 2),
  gear("bedroll", 5, 0.1),
  gear("silkRope50ft", 5, 10),
  gear("hempRope50ft", 10, 1),
  gear("torch", 1, 0.01),
  gear("waterskin", 4, 1),
  gear("trailRationsPerDay", 1, 0.5),
  gear("grapplingHook", 4, 1),
  gear("crowbar", 5, 2),
  gear("flintAndSteel", 0, 1),
  gear("hoodedLantern", 2, 7),
  gear("oilFlask", 1, 0.1),
  gear("thievesTools", 1, 30),
  gear("healersKit", 1, 50),
  gear("signalWhistle", 0, 0.8),
  gear("chalk", 0, 0.01),
  gear("manacles", 2, 15),
];

export const GEAR_BY_ID: Record<string, GearDefinition> = Object.fromEntries(GEAR.map((g) => [g.id, g]));
