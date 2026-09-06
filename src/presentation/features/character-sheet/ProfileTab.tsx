import { useTranslation } from "react-i18next";
import { RACES } from "@/content/races";
import { CLASSES } from "@/content/classes";
import { SIZE_CATEGORIES } from "@/domain/shared/size";
import { totalCharacterLevel, type PlayerCharacter } from "@/domain/character/types";
import { Button } from "@/presentation/components/Button";
import { Field, NumberInput, Select, TextInput } from "@/presentation/components/fields";
import { sortByLabel } from "@/shared/sortByLabel";

const ALIGNMENTS = ["lg", "ng", "cg", "ln", "n", "cn", "le", "ne", "ce"];

interface ProfileTabProps {
  character: PlayerCharacter;
  onChange: (updater: (character: PlayerCharacter) => PlayerCharacter) => void;
}

export function ProfileTab({ character, onChange }: ProfileTabProps) {
  const { t } = useTranslation();
  const sortedRaces = sortByLabel(RACES, (race) => t(race.nameKey));
  const sortedClasses = sortByLabel(CLASSES, (klass) => t(klass.nameKey));

  function addClassLevel() {
    const firstUnused = CLASSES.find((c) => !character.classLevels.some((cl) => cl.classId === c.id));
    const classId = firstUnused?.id ?? CLASSES[0]?.id ?? "fighter";
    onChange((c) => ({ ...c, classLevels: [...c.classLevels, { classId, level: 1 }] }));
  }

  function updateClassLevel(index: number, patch: Partial<{ classId: string; level: number }>) {
    onChange((c) => ({
      ...c,
      classLevels: c.classLevels.map((cl, i) => (i === index ? { ...cl, ...patch } : cl)),
    }));
  }

  function removeClassLevel(index: number) {
    onChange((c) => ({ ...c, classLevels: c.classLevels.filter((_, i) => i !== index) }));
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label={t("characterSheet.profile.name")}>
        <TextInput value={character.name} onChange={(e) => onChange((c) => ({ ...c, name: e.target.value }))} />
      </Field>
      <Field label={t("characterSheet.profile.playerName")}>
        <TextInput
          value={character.playerName}
          onChange={(e) => onChange((c) => ({ ...c, playerName: e.target.value }))}
        />
      </Field>

      <Field label={t("characterSheet.profile.race")}>
        <Select value={character.raceId} onChange={(e) => onChange((c) => ({ ...c, raceId: e.target.value }))}>
          {sortedRaces.map((race) => (
            <option key={race.id} value={race.id}>
              {t(race.nameKey)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("characterSheet.profile.size")}>
        <Select value={character.size} onChange={(e) => onChange((c) => ({ ...c, size: e.target.value as PlayerCharacter["size"] }))}>
          {SIZE_CATEGORIES.map((size) => (
            <option key={size} value={size}>
              {t(`srd:size.${size}`)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t("characterSheet.profile.alignment")}>
        <Select value={character.alignment} onChange={(e) => onChange((c) => ({ ...c, alignment: e.target.value }))}>
          <option value="" />
          {ALIGNMENTS.map((a) => (
            <option key={a} value={a}>
              {t(`srd:alignment.${a}`)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("characterSheet.profile.deity")}>
        <TextInput value={character.deity} onChange={(e) => onChange((c) => ({ ...c, deity: e.target.value }))} />
      </Field>

      <div className="sm:col-span-2">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t("characterSheet.profile.classesAndLevels")}</h3>
          <span className="text-xs text-muted-foreground">
            {t("characterSheet.profile.totalLevel")}: {totalCharacterLevel(character)}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {character.classLevels.map((cl, index) => (
            <div key={`${cl.classId}-${index}`} className="flex items-center gap-2">
              <Select
                aria-label={t("characterSheet.profile.class")}
                value={cl.classId}
                onChange={(e) => updateClassLevel(index, { classId: e.target.value })}
                className="flex-1"
              >
                {sortedClasses.map((klass) => (
                  <option key={klass.id} value={klass.id}>
                    {t(klass.nameKey)}
                  </option>
                ))}
              </Select>
              <NumberInput
                aria-label={t("characterSheet.profile.level")}
                min={1}
                max={20}
                value={cl.level}
                onChange={(e) => updateClassLevel(index, { level: Number(e.target.value) })}
                className="!w-20"
              />
              <Button variant="ghost" onClick={() => removeClassLevel(index)}>
                {t("actions.remove")}
              </Button>
            </div>
          ))}
        </div>
        <Button variant="secondary" className="mt-2" onClick={addClassLevel}>
          {t("characterSheet.profile.addClass")}
        </Button>
      </div>
    </div>
  );
}
