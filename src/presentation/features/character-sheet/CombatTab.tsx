import { useTranslation } from "react-i18next";
import { CLASSES_BY_ID } from "@/content/classes";
import { FEATS_BY_ID } from "@/content/feats";
import { RACES_BY_ID } from "@/content/races";
import { deriveAttacks, deriveCombatSheet } from "@/domain/character/calculations";
import type { PlayerCharacter } from "@/domain/character/types";
import { formatModifier } from "@/domain/shared/abilities";
import { Checkbox, Field, NumberInput } from "@/presentation/components/fields";

interface CombatTabProps {
  character: PlayerCharacter;
  onChange: (updater: (character: PlayerCharacter) => PlayerCharacter) => void;
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

export function CombatTab({ character, onChange }: CombatTabProps) {
  const { t } = useTranslation();
  const sheet = deriveCombatSheet(character, CLASSES_BY_ID, RACES_BY_ID, FEATS_BY_ID);
  const attacks = deriveAttacks(character, CLASSES_BY_ID, RACES_BY_ID, FEATS_BY_ID);

  function updateDefense(patch: Partial<PlayerCharacter["defense"]>) {
    onChange((c) => ({ ...c, defense: { ...c.defense, ...patch } }));
  }

  function updateHp(patch: Partial<PlayerCharacter["hitPoints"]>) {
    onChange((c) => ({ ...c, hitPoints: { ...c.hitPoints, ...patch } }));
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="mb-2 text-sm font-semibold">{t("characterSheet.combat.armorClass")}</h3>
        <div className="grid grid-cols-3 gap-3">
          <StatBox label={t("characterSheet.combat.acNormal")} value={sheet.armorClass.normal} />
          <StatBox label={t("characterSheet.combat.acTouch")} value={sheet.armorClass.touch} />
          <StatBox label={t("characterSheet.combat.acFlatFooted")} value={sheet.armorClass.flatFooted} />
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">{t("characterSheet.combat.savingThrows")}</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          <StatBox label={t("characterSheet.combat.baseAttackBonus")} value={`+${sheet.baseAttackBonus}`} />
          <StatBox label={t("characterSheet.combat.fort")} value={`+${sheet.savingThrows.fort}`} />
          <StatBox label={t("characterSheet.combat.ref")} value={`+${sheet.savingThrows.ref}`} />
          <StatBox label={t("characterSheet.combat.will")} value={`+${sheet.savingThrows.will}`} />
          <StatBox label={t("characterSheet.combat.initiative")} value={`+${sheet.initiative}`} />
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">{t("characterSheet.combat.combatManeuvers")}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox label={t("characterSheet.combat.cmb")} value={`+${sheet.combatManeuvers.cmb}`} />
          <StatBox label={t("characterSheet.combat.cmd")} value={sheet.combatManeuvers.cmd} />
          <StatBox label={t("characterSheet.combat.light")} value={sheet.carryingCapacity.light} />
          <StatBox label={t("characterSheet.combat.heavy")} value={sheet.carryingCapacity.heavy} />
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">{t("characterSheet.combat.encumbrance")}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox label={t("characterSheet.combat.carriedWeight")} value={sheet.encumbrance.totalWeight} />
          <StatBox
            label={t("characterSheet.combat.encumbranceLevel")}
            value={t(`characterSheet.combat.encumbranceLevels.${sheet.encumbrance.level}`)}
          />
          <StatBox
            label={t("characterSheet.combat.speed")}
            value={sheet.encumbrance.speed === null ? "—" : `${sheet.encumbrance.speed} ${t("characterSheet.combat.feet")}`}
          />
        </div>
        {sheet.encumbrance.level !== "light" ? (
          <p className="mt-2 text-xs text-muted-foreground">{t("characterSheet.combat.encumbranceHint")}</p>
        ) : null}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">{t("characterSheet.combat.attacks")}</h3>
        {attacks.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("characterSheet.combat.attacksEmpty")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {attacks.map((attack) => {
              const damageTypes = attack.customDamageTypes
                ? attack.damageTypes.join(", ")
                : attack.damageTypes.map((dt) => t(`characterSheet.inventory.damageTypes.${dt}`)).join(", ");
              return (
                <div
                  key={attack.inventoryItemId}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-card p-3 text-sm"
                >
                  <span className="font-semibold">{attack.name}</span>
                  <span>
                    {t("characterSheet.combat.attackBonus")}: {formatModifier(attack.attackBonus)}
                  </span>
                  <span>
                    {t("characterSheet.inventory.damage")}: {attack.damageDice}
                    {attack.damageBonus !== 0 ? formatModifier(attack.damageBonus) : ""}
                  </span>
                  <span className="text-muted-foreground">
                    {t("characterSheet.inventory.critical")} {attack.critRange}/×{attack.critMultiplier} — {damageTypes}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t("characterSheet.combat.hitPoints")}</h3>
          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            <Checkbox
              checked={!character.hitPoints.autoMax}
              onChange={(e) => updateHp({ autoMax: !e.target.checked })}
            />
            {t("characterSheet.combat.hpManual")}
          </label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label={t("characterSheet.combat.hpMax")}>
            {character.hitPoints.autoMax ? (
              <NumberInput value={sheet.hitPointsMax} disabled />
            ) : (
              <NumberInput value={character.hitPoints.max} onChange={(e) => updateHp({ max: Number(e.target.value) })} />
            )}
          </Field>
          <Field label={t("characterSheet.combat.hpCurrent")}>
            <NumberInput
              value={character.hitPoints.current}
              onChange={(e) => updateHp({ current: Number(e.target.value) })}
            />
          </Field>
          <Field label={t("characterSheet.combat.hpNonLethal")}>
            <NumberInput
              value={character.hitPoints.nonLethal}
              onChange={(e) => updateHp({ nonLethal: Number(e.target.value) })}
            />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold">{t("characterSheet.combat.defenseLoadout")}</h3>
        <p className="mb-2 text-xs text-muted-foreground">{t("characterSheet.combat.defenseLoadoutHint")}</p>
        <p className="mb-3 text-sm">
          {t("characterSheet.combat.fromEquipment")}: {t("characterSheet.combat.armorBonus")}{" "}
          {formatModifier(sheet.equipmentDefenseBonuses.armorBonus)}, {t("characterSheet.combat.shieldBonus")}{" "}
          {formatModifier(sheet.equipmentDefenseBonuses.shieldBonus)}, {t("characterSheet.combat.armorCheckPenalty")}{" "}
          {formatModifier(-sheet.equipmentDefenseBonuses.armorCheckPenalty)}, {t("characterSheet.combat.armorMaxDexBonus")}{" "}
          {sheet.equipmentDefenseBonuses.armorMaxDexBonus === null
            ? "—"
            : formatModifier(sheet.equipmentDefenseBonuses.armorMaxDexBonus)}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label={t("characterSheet.combat.armorBonus")}>
            <NumberInput
              value={character.defense.armorBonus}
              onChange={(e) => updateDefense({ armorBonus: Number(e.target.value) })}
            />
          </Field>
          <Field label={t("characterSheet.combat.shieldBonus")}>
            <NumberInput
              value={character.defense.shieldBonus}
              onChange={(e) => updateDefense({ shieldBonus: Number(e.target.value) })}
            />
          </Field>
          <Field label={t("characterSheet.combat.armorMaxDexBonus")}>
            <NumberInput
              value={character.defense.armorMaxDexBonus ?? ""}
              placeholder="∞"
              onChange={(e) =>
                updateDefense({ armorMaxDexBonus: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
          </Field>
          <Field label={t("characterSheet.combat.armorCheckPenalty")}>
            <NumberInput
              value={character.defense.armorCheckPenalty}
              onChange={(e) => updateDefense({ armorCheckPenalty: Number(e.target.value) })}
            />
          </Field>
          <Field label={t("characterSheet.combat.naturalArmor")}>
            <NumberInput
              value={character.defense.naturalArmor}
              onChange={(e) => updateDefense({ naturalArmor: Number(e.target.value) })}
            />
          </Field>
          <Field label={t("characterSheet.combat.deflection")}>
            <NumberInput
              value={character.defense.deflection}
              onChange={(e) => updateDefense({ deflection: Number(e.target.value) })}
            />
          </Field>
          <Field label={t("characterSheet.combat.dodge")}>
            <NumberInput
              value={character.defense.dodge}
              onChange={(e) => updateDefense({ dodge: Number(e.target.value) })}
            />
          </Field>
          <Field label={t("characterSheet.combat.miscAc")}>
            <NumberInput
              value={character.defense.miscAc}
              onChange={(e) => updateDefense({ miscAc: Number(e.target.value) })}
            />
          </Field>
        </div>
      </section>
    </div>
  );
}
