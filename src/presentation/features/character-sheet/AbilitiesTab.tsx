import { useTranslation } from "react-i18next";
import { RACES_BY_ID } from "@/content/races";
import { deriveEffectiveAbilityScores } from "@/domain/character/calculations";
import { ABILITY_NAMES, abilityModifier, formatModifier } from "@/domain/shared/abilities";
import type { PlayerCharacter } from "@/domain/character/types";
import { Field, NumberInput } from "@/presentation/components/fields";

interface AbilitiesTabProps {
  character: PlayerCharacter;
  onChange: (updater: (character: PlayerCharacter) => PlayerCharacter) => void;
}

export function AbilitiesTab({ character, onChange }: AbilitiesTabProps) {
  const { t } = useTranslation();
  const effectiveScores = deriveEffectiveAbilityScores(character, RACES_BY_ID);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {ABILITY_NAMES.map((ability) => {
        const score = character.abilityScores[ability];
        const effectiveScore = effectiveScores[ability];
        const racialAdjustment = effectiveScore - score;
        return (
          <div key={ability} className="rounded-lg border border-border bg-card p-3 text-center">
            <div className="text-xs font-medium text-muted-foreground">{t(`characterSheet.abilities.${ability}`)}</div>
            <Field label={t("characterSheet.abilities.score")}>
              <NumberInput
                value={score}
                onChange={(e) =>
                  onChange((c) => ({
                    ...c,
                    abilityScores: { ...c.abilityScores, [ability]: Number(e.target.value) },
                  }))
                }
                className="text-center"
              />
            </Field>
            {racialAdjustment !== 0 ? (
              <div className="mt-1 text-[10px] text-muted-foreground">
                {t("characterSheet.abilities.withRace", { score: effectiveScore, adjustment: formatModifier(racialAdjustment) })}
              </div>
            ) : null}
            <div className="mt-1 text-lg font-semibold">{formatModifier(abilityModifier(effectiveScore))}</div>
          </div>
        );
      })}
    </div>
  );
}
