import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCharacterStore } from "@/application/stores/characterStore";
import { createNewCharacter } from "@/application/useCases/createCharacter";
import { duplicateCharacter } from "@/application/useCases/duplicateCharacter";
import { exportCharacterToFile } from "@/application/useCases/exportCharacterToFile";
import { importCharacterFromFile, InvalidSaveFileError } from "@/application/useCases/importCharacterFromFile";
import { totalCharacterLevel, type PlayerCharacter } from "@/domain/character/types";
import { Button } from "@/presentation/components/Button";
import { useConfirm } from "@/presentation/components/ConfirmProvider";
import { StatusBanner, useStatusMessage } from "@/presentation/components/StatusBanner";

function characterSummary(character: PlayerCharacter, t: (key: string) => string): string {
  const race = t(`srd:race.${character.raceId}`);
  const classes = character.classLevels.map((cl) => `${t(`srd:class.${cl.classId}`)} ${cl.level}`).join(" / ");
  return classes ? `${race} — ${classes}` : race;
}

export function CharacterListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { message, setMessage } = useStatusMessage();

  const characters = useCharacterStore((s) => s.characters);
  const companions = useCharacterStore((s) => s.companions);
  const addCharacter = useCharacterStore((s) => s.addCharacter);
  const removeCharacter = useCharacterStore((s) => s.removeCharacter);
  const upsertCharacterWithCompanions = useCharacterStore((s) => s.upsertCharacterWithCompanions);

  function handleNew() {
    const character = createNewCharacter(t("characterList.defaultCharacterName"));
    addCharacter(character);
    navigate(`/characters/${character.id}`);
  }

  function handleDuplicate(character: PlayerCharacter) {
    const clone = duplicateCharacter(character, `${character.name} ${t("characterList.copySuffix")}`);
    addCharacter(clone);
  }

  async function handleDelete(character: PlayerCharacter) {
    const confirmed = await confirm({
      title: t("confirm.deleteCharacterTitle"),
      body: t("confirm.deleteCharacterBody", { name: character.name }),
      confirmLabel: t("actions.delete"),
      destructive: true,
    });
    if (confirmed) removeCharacter(character.id);
  }

  function handleExport(character: PlayerCharacter) {
    exportCharacterToFile(character, companions);
    setMessage({ kind: "success", text: t("status.exported") });
  }

  async function handleImport() {
    try {
      const saveFile = await importCharacterFromFile();
      const collides = characters.some((c) => c.id === saveFile.character.id);
      if (collides) {
        const confirmed = await confirm({
          title: t("confirm.overwriteOnImportTitle"),
          body: t("confirm.overwriteOnImportBody"),
          confirmLabel: t("actions.confirm"),
          destructive: true,
        });
        if (!confirmed) return;
      }
      upsertCharacterWithCompanions(saveFile.character, saveFile.companions);
      setMessage({ kind: "success", text: t("status.imported") });
    } catch (error) {
      if (error instanceof InvalidSaveFileError) {
        setMessage({ kind: "error", text: t("status.importError") });
      }
      // A cancelled file picker rejects too; there's nothing to report in that case.
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("characterList.heading")}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleImport}>
            {t("characterList.importCharacter")}
          </Button>
          <Button variant="primary" onClick={handleNew}>
            {t("characterList.newCharacter")}
          </Button>
        </div>
      </div>

      <StatusBanner message={message} />

      {characters.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("status.noCharacters")}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {characters.map((character) => (
            <li key={character.id} className="rounded-lg border border-border bg-card p-4 text-card-foreground">
              <div className="mb-1 text-base font-semibold">{character.name}</div>
              <div className="mb-3 text-sm text-muted-foreground">{characterSummary(character, t)}</div>
              <div className="mb-3 text-xs text-muted-foreground">
                {t("characterList.levelLabel", { level: totalCharacterLevel(character) })} ·{" "}
                {t("characterList.companionsCount", { count: character.companions.length })}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={() => navigate(`/characters/${character.id}`)}>
                  {t("actions.open")}
                </Button>
                <Button variant="secondary" onClick={() => handleDuplicate(character)}>
                  {t("actions.duplicate")}
                </Button>
                <Button variant="secondary" onClick={() => handleExport(character)}>
                  {t("actions.export")}
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(character)}>
                  {t("actions.delete")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
