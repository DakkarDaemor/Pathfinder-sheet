import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { ARMORS, ARMORS_BY_ID, GEAR, WEAPONS, WEAPONS_BY_ID } from "@/content/equipment";
import type { ArmorDefinition, GearDefinition, WeaponDefinition } from "@/content/types";
import type { PlayerCharacter } from "@/domain/character/types";
import { Button } from "@/presentation/components/Button";
import { Checkbox, NumberInput, Select, TextInput } from "@/presentation/components/fields";
import { generateId } from "@/shared/id";
import { sortByLabel } from "@/shared/sortByLabel";

interface InventoryTabProps {
  character: PlayerCharacter;
  onChange: (updater: (character: PlayerCharacter) => PlayerCharacter) => void;
}

type CatalogEntry = (WeaponDefinition | ArmorDefinition | GearDefinition) & { group: string };

export function InventoryTab({ character, onChange }: InventoryTabProps) {
  const { t } = useTranslation();

  const catalog: CatalogEntry[] = [
    ...WEAPONS.map((w) => ({ ...w, group: "weapon" })),
    ...ARMORS.map((a) => ({ ...a, group: "armor" })),
    ...GEAR.map((g) => ({ ...g, group: "gear" })),
  ];
  const sortedCatalog = sortByLabel(catalog, (entry) => t(entry.nameKey));

  function describeItem(equipmentId: string | null): string | null {
    if (!equipmentId) return null;
    const weaponDef = WEAPONS_BY_ID[equipmentId];
    if (weaponDef) {
      const types = weaponDef.damageTypes.map((dt) => t(`characterSheet.inventory.damageTypes.${dt}`)).join(", ");
      return `${t("characterSheet.inventory.damage")}: ${weaponDef.damage} (${t("characterSheet.inventory.critical")} ${weaponDef.critRange}/×${weaponDef.critMultiplier}) — ${types}`;
    }
    const armorDef = ARMORS_BY_ID[equipmentId];
    if (armorDef) {
      const maxDex = armorDef.maxDexBonus === null ? "—" : `+${armorDef.maxDexBonus}`;
      return `${t("characterSheet.inventory.armorClassBonus")}: +${armorDef.acBonus}, ${t("characterSheet.inventory.maxDex")}: ${maxDex}, ${t("characterSheet.inventory.checkPenalty")}: ${armorDef.checkPenalty}, ${t("characterSheet.inventory.spellFailure")}: ${armorDef.spellFailurePercent}%`;
    }
    return null;
  }

  function addFromCatalog(entryId: string) {
    const entry = catalog.find((e) => e.id === entryId);
    if (!entry) return;
    onChange((c) => ({
      ...c,
      inventory: [
        ...c.inventory,
        {
          id: generateId(),
          equipmentId: entry.id,
          name: t(entry.nameKey),
          quantity: 1,
          weight: entry.weight,
          equipped: false,
          customQualities: "",
          notes: "",
        },
      ],
    }));
  }

  function addCustomItem() {
    onChange((c) => ({
      ...c,
      inventory: [
        ...c.inventory,
        {
          id: generateId(),
          equipmentId: null,
          name: "",
          quantity: 1,
          weight: 0,
          equipped: false,
          customQualities: "",
          notes: "",
        },
      ],
    }));
  }

  function updateItem(id: string, patch: Partial<PlayerCharacter["inventory"][number]>) {
    onChange((c) => ({ ...c, inventory: c.inventory.map((item) => (item.id === id ? { ...item, ...patch } : item)) }));
  }

  function removeItem(id: string) {
    onChange((c) => ({ ...c, inventory: c.inventory.filter((item) => item.id !== id) }));
  }

  const totalWeight = character.inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{t("characterSheet.inventory.heading")}</h3>

      {character.inventory.length === 0 ? (
        <p className="mb-3 text-sm text-muted-foreground">{t("characterSheet.inventory.empty")}</p>
      ) : (
        <div className="mb-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-2">{t("characterSheet.inventory.itemName")}</th>
                <th className="px-2 py-2 text-center">{t("characterSheet.inventory.quantity")}</th>
                <th className="px-2 py-2 text-center">{t("characterSheet.inventory.weight")}</th>
                <th className="px-2 py-2 text-center">{t("characterSheet.inventory.equipped")}</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {character.inventory.map((item) => {
                const details = describeItem(item.equipmentId);
                const showCustomQualities = !item.equipmentId;
                return (
                  <Fragment key={item.id}>
                    <tr className={details || showCustomQualities ? "border-none" : "border-b border-border/60"}>
                      <td className="py-1.5 pr-2">
                        <TextInput value={item.name} onChange={(e) => updateItem(item.id, { name: e.target.value })} />
                      </td>
                      <td className="px-2 py-1.5">
                        <NumberInput
                          min={0}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                          className="!w-16 text-center"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <NumberInput
                          min={0}
                          value={item.weight}
                          onChange={(e) => updateItem(item.id, { weight: Number(e.target.value) })}
                          className="!w-20 text-center"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <Checkbox
                          checked={item.equipped}
                          onChange={(e) => updateItem(item.id, { equipped: e.target.checked })}
                        />
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <Button variant="ghost" onClick={() => removeItem(item.id)}>
                          {t("actions.remove")}
                        </Button>
                      </td>
                    </tr>
                    {details ? (
                      <tr className="border-b border-border/60">
                        <td colSpan={5} className="px-0 pb-1.5 pr-2 text-xs text-muted-foreground">
                          {details}
                        </td>
                      </tr>
                    ) : null}
                    {showCustomQualities ? (
                      <tr className="border-b border-border/60">
                        <td colSpan={5} className="px-0 pb-1.5 pr-2">
                          <TextInput
                            aria-label={t("characterSheet.inventory.customQualities")}
                            placeholder={t("characterSheet.inventory.customQualities")}
                            value={item.customQualities}
                            onChange={(e) => updateItem(item.id, { customQualities: e.target.value })}
                          />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mb-3 text-sm font-medium">
        {t("characterSheet.inventory.totalWeight")}: {totalWeight}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          aria-label={t("characterSheet.inventory.itemName")}
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) addFromCatalog(e.target.value);
            e.target.value = "";
          }}
          className="!w-auto"
        >
          <option value="" disabled>
            {t("actions.add")}
          </option>
          {sortedCatalog.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {t(entry.nameKey)}
            </option>
          ))}
        </Select>
        <Button variant="secondary" onClick={addCustomItem}>
          {t("actions.add")}
        </Button>
      </div>
    </div>
  );
}
