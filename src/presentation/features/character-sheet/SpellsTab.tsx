import { useTranslation } from "react-i18next";
import { SPELLS, SPELLS_BY_ID } from "@/content/spells";
import type { PlayerCharacter } from "@/domain/character/types";
import { Button } from "@/presentation/components/Button";
import { Checkbox, Select } from "@/presentation/components/fields";
import { generateId } from "@/shared/id";

interface SpellsTabProps {
  character: PlayerCharacter;
  onChange: (updater: (character: PlayerCharacter) => PlayerCharacter) => void;
}

export function SpellsTab({ character, onChange }: SpellsTabProps) {
  const { t } = useTranslation();
  const characterClassIds = character.classLevels.map((cl) => cl.classId);
  const availableSpells = SPELLS.filter((spell) => characterClassIds.some((classId) => classId in spell.levelsByClass));

  function addSpell() {
    const firstSpell = availableSpells[0] ?? SPELLS[0];
    if (!firstSpell) return;
    onChange((c) => ({ ...c, spells: [...c.spells, { id: generateId(), spellId: firstSpell.id, prepared: false }] }));
  }

  function updateSpell(id: string, patch: Partial<{ spellId: string; prepared: boolean }>) {
    onChange((c) => ({ ...c, spells: c.spells.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  }

  function removeSpell(id: string) {
    onChange((c) => ({ ...c, spells: c.spells.filter((s) => s.id !== id) }));
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{t("characterSheet.spells.heading")}</h3>
      {character.spells.length === 0 ? (
        <p className="mb-3 text-sm text-muted-foreground">{t("characterSheet.spells.empty")}</p>
      ) : (
        <ul className="mb-3 flex flex-col gap-2">
          {character.spells.map((known) => {
            const def = SPELLS_BY_ID[known.spellId];
            return (
              <li key={known.id} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
                <Select
                  aria-label={t("characterSheet.spells.selectSpell")}
                  value={known.spellId}
                  onChange={(e) => updateSpell(known.id, { spellId: e.target.value })}
                  className="flex-1"
                >
                  {SPELLS.map((spell) => (
                    <option key={spell.id} value={spell.id}>
                      {t(spell.nameKey)}
                    </option>
                  ))}
                </Select>
                {def ? <span className="text-xs text-muted-foreground">{t(def.descriptionKey)}</span> : null}
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
              </li>
            );
          })}
        </ul>
      )}
      <Button variant="secondary" onClick={addSpell}>
        {t("actions.add")}
      </Button>
    </div>
  );
}
