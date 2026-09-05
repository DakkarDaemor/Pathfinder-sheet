import { useTranslation } from "react-i18next";
import { CLASSES_BY_ID } from "@/content/classes";
import { COMPANION_BASES_BY_ID, companionBasesForKind } from "@/content/companions";
import { resolveBaseAttackBonus, resolveBaseSaves } from "@/domain/character/calculations";
import { totalCharacterLevel, type PlayerCharacter } from "@/domain/character/types";
import { deriveCompanionCombatSheet } from "@/domain/companion/calculations";
import { listCompanionKinds } from "@/domain/companion/registry";
import type { Companion, CompanionKind } from "@/domain/companion/types";
import { useCharacterStore } from "@/application/stores/characterStore";
import { createNewCompanion } from "@/application/useCases/createCompanion";
import { Button } from "@/presentation/components/Button";
import { useConfirm } from "@/presentation/components/ConfirmProvider";
import { Field, NumberInput, Select, TextArea, TextInput } from "@/presentation/components/fields";

interface CompanionsTabProps {
  character: PlayerCharacter;
  onChange: (updater: (character: PlayerCharacter) => PlayerCharacter) => void;
}

function CompanionCard({
  companion,
  masterLevel,
  master,
  onUpdate,
  onRemove,
}: {
  companion: Companion;
  masterLevel: number;
  master: { baseAttackBonus: number; baseSaves: ReturnType<typeof resolveBaseSaves> };
  onUpdate: (patch: Partial<Companion>) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const base = COMPANION_BASES_BY_ID[companion.baseId];
  const bases = companionBasesForKind(companion.kind);

  if (!base) return null;

  const sheet = deriveCompanionCombatSheet(companion, base, masterLevel, master);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <TextInput
          value={companion.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="flex-1"
          placeholder={t("characterSheet.profile.name")}
        />
        <Select value={companion.baseId} onChange={(e) => onUpdate({ baseId: e.target.value })} className="w-auto">
          {bases.map((b) => (
            <option key={b.id} value={b.id}>
              {t(b.nameKey)}
            </option>
          ))}
        </Select>
        <Button variant="destructive" onClick={onRemove}>
          {t("actions.remove")}
        </Button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-6">
        {(["str", "dex", "con", "int", "wis", "cha"] as const).map((ability) => (
          <div key={ability} className="rounded-md border border-border p-2">
            <div className="text-[10px] uppercase text-muted-foreground">{ability}</div>
            <div className="text-sm font-semibold">{sheet.abilityScores[ability]}</div>
          </div>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <div className="rounded-md border border-border p-2">
          <div className="text-[10px] text-muted-foreground">{t("characterSheet.combat.acNormal")}</div>
          <div className="text-sm font-semibold">{sheet.armorClass.normal}</div>
        </div>
        <div className="rounded-md border border-border p-2">
          <div className="text-[10px] text-muted-foreground">{t("characterSheet.combat.baseAttackBonus")}</div>
          <div className="text-sm font-semibold">+{sheet.baseAttackBonus}</div>
        </div>
        <div className="rounded-md border border-border p-2">
          <div className="text-[10px] text-muted-foreground">{t("characterSheet.combat.cmb")}/{t("characterSheet.combat.cmd")}</div>
          <div className="text-sm font-semibold">
            +{sheet.combatManeuvers.cmb} / {sheet.combatManeuvers.cmd}
          </div>
        </div>
        <div className="rounded-md border border-border p-2">
          <div className="text-[10px] text-muted-foreground">
            {t("characterSheet.combat.fort")}/{t("characterSheet.combat.ref")}/{t("characterSheet.combat.will")}
          </div>
          <div className="text-sm font-semibold">
            +{sheet.savingThrows.fort}/+{sheet.savingThrows.ref}/+{sheet.savingThrows.will}
          </div>
        </div>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">
        {t(base.naturalAttacksKey)}
        {base.specialQualitiesKey ? ` — ${t(base.specialQualitiesKey)}` : ""}
      </p>

      <Field label={t("characterSheet.companions.tricksOrTraits")}>
        <TextArea
          rows={2}
          value={companion.tricksOrTraits.join(", ")}
          onChange={(e) => onUpdate({ tricksOrTraits: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })}
        />
      </Field>
    </div>
  );
}

export function CompanionsTab({ character, onChange }: CompanionsTabProps) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const companions = useCharacterStore((s) => s.companions);
  const addCompanionToStore = useCharacterStore((s) => s.addCompanion);
  const updateCompanionInStore = useCharacterStore((s) => s.updateCompanion);
  const removeCompanionFromStore = useCharacterStore((s) => s.removeCompanion);

  const linkedCompanions = character.companions
    .map((link) => companions.find((c) => c.id === link.companionId))
    .filter((c): c is Companion => c !== undefined);

  const masterLevel = totalCharacterLevel(character);
  const master = {
    baseAttackBonus: resolveBaseAttackBonus(character, CLASSES_BY_ID),
    baseSaves: resolveBaseSaves(character, CLASSES_BY_ID),
  };

  function addCompanion(kind: CompanionKind) {
    const base = companionBasesForKind(kind)[0];
    if (!base) return;
    const companion = createNewCompanion(kind, base.id, character.id, t(base.nameKey));
    addCompanionToStore(companion);
    onChange((c) => ({ ...c, companions: [...c.companions, { companionId: companion.id, kind }] }));
  }

  async function removeCompanion(companion: Companion) {
    const confirmed = await confirm({
      title: t("confirm.deleteCompanionTitle"),
      body: t("confirm.deleteCompanionBody", { name: companion.name }),
      confirmLabel: t("actions.delete"),
      destructive: true,
    });
    if (confirmed) removeCompanionFromStore(companion.id);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("characterSheet.companions.heading")}</h3>
        <Field label={t("characterSheet.companions.masterLevel")}>
          <NumberInput value={masterLevel} readOnly className="w-20" />
        </Field>
      </div>

      {linkedCompanions.length === 0 ? (
        <p className="mb-3 text-sm text-muted-foreground">{t("characterSheet.companions.empty")}</p>
      ) : (
        <div className="mb-4 flex flex-col gap-4">
          {linkedCompanions.map((companion) => (
            <CompanionCard
              key={companion.id}
              companion={companion}
              masterLevel={masterLevel}
              master={master}
              onUpdate={(patch) => updateCompanionInStore(companion.id, (c) => ({ ...c, ...patch }))}
              onRemove={() => removeCompanion(companion)}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {listCompanionKinds().map((kindDef) => (
          <Button key={kindDef.kind} variant="secondary" onClick={() => addCompanion(kindDef.kind)}>
            {t("characterSheet.companions.addCompanion")}: {t(kindDef.labelKey)}
          </Button>
        ))}
      </div>
    </div>
  );
}
