import { useTranslation } from "react-i18next";
import { ARMORS, GEAR, WEAPONS } from "@/content/equipment";
import type { ArmorDefinition, GearDefinition, WeaponDefinition } from "@/content/types";
import type { PlayerCharacter } from "@/domain/character/types";
import { Button } from "@/presentation/components/Button";
import { Checkbox, NumberInput, Select, TextInput } from "@/presentation/components/fields";
import { generateId } from "@/shared/id";

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
        { id: generateId(), equipmentId: null, name: "", quantity: 1, weight: 0, equipped: false, notes: "" },
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
              {character.inventory.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
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
              ))}
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
          {catalog.map((entry) => (
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
