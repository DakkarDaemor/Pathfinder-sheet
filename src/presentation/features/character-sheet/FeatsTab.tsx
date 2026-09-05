import { useTranslation } from "react-i18next";
import { FEATS, FEATS_BY_ID } from "@/content/feats";
import type { PlayerCharacter } from "@/domain/character/types";
import { Button } from "@/presentation/components/Button";
import { Select, TextInput } from "@/presentation/components/fields";
import { generateId } from "@/shared/id";

interface FeatsTabProps {
  character: PlayerCharacter;
  onChange: (updater: (character: PlayerCharacter) => PlayerCharacter) => void;
}

export function FeatsTab({ character, onChange }: FeatsTabProps) {
  const { t } = useTranslation();

  function addFeat() {
    const firstFeat = FEATS[0];
    if (!firstFeat) return;
    onChange((c) => ({ ...c, feats: [...c.feats, { id: generateId(), featId: firstFeat.id, notes: "" }] }));
  }

  function updateFeat(id: string, patch: Partial<{ featId: string; notes: string }>) {
    onChange((c) => ({ ...c, feats: c.feats.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
  }

  function removeFeat(id: string) {
    onChange((c) => ({ ...c, feats: c.feats.filter((f) => f.id !== id) }));
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{t("characterSheet.feats.heading")}</h3>
      {character.feats.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("characterSheet.feats.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {character.feats.map((featSlot) => {
            const def = FEATS_BY_ID[featSlot.featId];
            return (
              <li key={featSlot.id} className="rounded-lg border border-border bg-card p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Select
                    aria-label={t("characterSheet.feats.selectFeat")}
                    value={featSlot.featId}
                    onChange={(e) => updateFeat(featSlot.id, { featId: e.target.value })}
                    className="flex-1"
                  >
                    {FEATS.map((feat) => (
                      <option key={feat.id} value={feat.id}>
                        {t(feat.nameKey)}
                      </option>
                    ))}
                  </Select>
                  <Button variant="ghost" onClick={() => removeFeat(featSlot.id)}>
                    {t("actions.remove")}
                  </Button>
                </div>
                {def ? (
                  <p className="mb-2 text-xs text-muted-foreground">
                    {t(def.descriptionKey)}
                    {def.prerequisiteKey ? ` — ${t(def.prerequisiteKey)}` : ""}
                  </p>
                ) : null}
                <TextInput
                  aria-label={t("characterSheet.feats.notes")}
                  placeholder={t("characterSheet.feats.notes")}
                  value={featSlot.notes}
                  onChange={(e) => updateFeat(featSlot.id, { notes: e.target.value })}
                />
              </li>
            );
          })}
        </ul>
      )}
      <Button variant="secondary" className="mt-3" onClick={addFeat}>
        {t("actions.add")}
      </Button>
    </div>
  );
}
