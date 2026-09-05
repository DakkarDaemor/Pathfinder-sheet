import { useTranslation } from "react-i18next";
import { CLASSES_BY_ID } from "@/content/classes";
import { deriveCombatSheet } from "@/domain/character/calculations";
import type { PlayerCharacter } from "@/domain/character/types";
import { Field, NumberInput } from "@/presentation/components/fields";

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
  const sheet = deriveCombatSheet(character, CLASSES_BY_ID);

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
        <h3 className="mb-2 text-sm font-semibold">{t("characterSheet.combat.hitPoints")}</h3>
        <div className="grid grid-cols-3 gap-3">
          <Field label={t("characterSheet.combat.hpMax")}>
            <NumberInput value={character.hitPoints.max} onChange={(e) => updateHp({ max: Number(e.target.value) })} />
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
        <h3 className="mb-2 text-sm font-semibold">{t("characterSheet.combat.defenseLoadout")}</h3>
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
