import { useTranslation } from "react-i18next";
import { CLASSES_BY_ID } from "@/content/classes";
import { RACES_BY_ID } from "@/content/races";
import { SPELLS, SPELLS_BY_ID } from "@/content/spells";
import { deriveSpellDC, deriveSpellSlots } from "@/domain/character/spellcasting";
import type { KnownSpell, PlayerCharacter } from "@/domain/character/types";
import { Button } from "@/presentation/components/Button";
import { Checkbox, NumberInput, Select, TextInput } from "@/presentation/components/fields";
import { generateId } from "@/shared/id";
import { sortByLabel } from "@/shared/sortByLabel";

interface SpellsTabProps {
  character: PlayerCharacter;
  onChange: (updater: (character: PlayerCharacter) => PlayerCharacter) => void;
}

export function SpellsTab({ character, onChange }: SpellsTabProps) {
  const { t } = useTranslation();
  const characterClassIds = character.classLevels.map((cl) => cl.classId);
  const availableSpells = SPELLS.filter((spell) => characterClassIds.some((classId) => classId in spell.levelsByClass));
  const sortedSpells = sortByLabel(SPELLS, (spell) => t(spell.nameKey));
  const spellSlots = deriveSpellSlots(character, CLASSES_BY_ID, RACES_BY_ID);
  const castingClassIds = character.classLevels
    .map((cl) => cl.classId)
    .filter((classId) => CLASSES_BY_ID[classId]?.isSpellcaster);

  function addSpell() {
    const firstSpell = availableSpells[0] ?? SPELLS[0];
    if (!firstSpell) return;
    onChange((c) => ({
      ...c,
      spells: [
        ...c.spells,
        {
          id: generateId(),
          spellId: firstSpell.id,
          customName: "",
          customDescription: "",
          customSchool: "",
          customLevel: 0,
          customSpellcastingClassId: null,
          prepared: false,
        },
      ],
    }));
  }

  function addCustomSpell() {
    onChange((c) => ({
      ...c,
      spells: [
        ...c.spells,
        {
          id: generateId(),
          spellId: null,
          customName: "",
          customDescription: "",
          customSchool: "",
          customLevel: 0,
          customSpellcastingClassId: castingClassIds[0] ?? null,
          prepared: false,
        },
      ],
    }));
  }

  function updateSpell(id: string, patch: Partial<Omit<KnownSpell, "id">>) {
    onChange((c) => ({ ...c, spells: c.spells.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  }

  function removeSpell(id: string) {
    onChange((c) => ({ ...c, spells: c.spells.filter((s) => s.id !== id) }));
  }

  return (
    <div>
      {spellSlots.length > 0 ? (
        <section className="mb-4">
          <h3 className="mb-2 text-sm font-semibold">{t("characterSheet.spells.slotsPerDay")}</h3>
          <div className="flex flex-col gap-2">
            {spellSlots.map((entry) => {
              const classDef = CLASSES_BY_ID[entry.classId];
              const levels = entry.slotsByLevel
                .map((slots, level) => (slots === null ? null : `${level}: ${slots}`))
                .filter((s): s is string => s !== null);
              return (
                <div key={entry.classId} className="rounded-lg border border-border bg-card p-2 text-sm">
                  <span className="font-semibold">{classDef ? t(classDef.nameKey) : entry.classId}</span>{" "}
                  <span className="text-muted-foreground">({t("characterSheet.profile.level")} {entry.classLevel})</span>:{" "}
                  {levels.join(", ")}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
      <h3 className="mb-2 text-sm font-semibold">{t("characterSheet.spells.heading")}</h3>
      {character.spells.length === 0 ? (
        <p className="mb-3 text-sm text-muted-foreground">{t("characterSheet.spells.empty")}</p>
      ) : (
        <ul className="mb-3 flex flex-col gap-2">
          {character.spells.map((known) => {
            const def = known.spellId ? SPELLS_BY_ID[known.spellId] : undefined;
            const dc = deriveSpellDC(known, character, CLASSES_BY_ID, RACES_BY_ID);
            return (
              <li key={known.id} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-2">
                <div className="flex flex-wrap items-center gap-2">
                  {known.spellId ? (
                    <Select
                      aria-label={t("characterSheet.spells.selectSpell")}
                      value={known.spellId}
                      onChange={(e) => updateSpell(known.id, { spellId: e.target.value })}
                      className="flex-1"
                    >
                      {sortedSpells.map((spell) => (
                        <option key={spell.id} value={spell.id}>
                          {t(spell.nameKey)}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <TextInput
                      aria-label={t("characterSheet.spells.customName")}
                      placeholder={t("characterSheet.spells.customName")}
                      value={known.customName}
                      onChange={(e) => updateSpell(known.id, { customName: e.target.value })}
                      className="flex-1"
                    />
                  )}
                  {!known.spellId ? (
                    <>
                      <TextInput
                        aria-label={t("characterSheet.spells.customSchool")}
                        placeholder={t("characterSheet.spells.customSchool")}
                        value={known.customSchool}
                        onChange={(e) => updateSpell(known.id, { customSchool: e.target.value })}
                        className="!w-28"
                      />
                      <NumberInput
                        aria-label={t("characterSheet.spells.customLevel")}
                        min={0}
                        max={9}
                        value={known.customLevel}
                        onChange={(e) => updateSpell(known.id, { customLevel: Number(e.target.value) })}
                        className="!w-16 text-center"
                      />
                      <Select
                        aria-label={t("characterSheet.spells.customCastingClass")}
                        value={known.customSpellcastingClassId ?? ""}
                        onChange={(e) => updateSpell(known.id, { customSpellcastingClassId: e.target.value || null })}
                        className="!w-auto"
                      >
                        <option value="" />
                        {castingClassIds.map((classId) => (
                          <option key={classId} value={classId}>
                            {t(CLASSES_BY_ID[classId]!.nameKey)}
                          </option>
                        ))}
                      </Select>
                    </>
                  ) : null}
                  <label className="flex items-center gap-1 text-xs">
                    <Checkbox
                      checked={known.prepared}
                      onChange={(e) => updateSpell(known.id, { prepared: e.target.checked })}
                    />
                    {t("characterSheet.spells.prepared")}
                  </label>
                  <Button variant="ghost" onClick={() => removeSpell(known.id)}>
                    {t("actions.remove")}
                  </Button>
                </div>
                {dc !== null ? (
                  <span className="text-xs text-muted-foreground">{t("characterSheet.spells.dc", { dc })}</span>
                ) : null}
                {def ? <span className="text-xs text-muted-foreground">{t(def.descriptionKey)}</span> : null}
                {!known.spellId ? (
                  <TextInput
                    aria-label={t("characterSheet.spells.customDescription")}
                    placeholder={t("characterSheet.spells.customDescription")}
                    value={known.customDescription}
                    onChange={(e) => updateSpell(known.id, { customDescription: e.target.value })}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={addSpell}>
          {t("actions.add")}
        </Button>
        <Button variant="secondary" onClick={addCustomSpell}>
          {t("characterSheet.spells.addCustom")}
        </Button>
      </div>
    </div>
  );
}
