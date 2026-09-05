import type { PlayerCharacter } from "@/domain/character/types";
import type { Companion } from "@/domain/companion/types";
import type { CharacterSaveFile } from "@/infrastructure/persistence/saveFileSchema";
import { downloadJson } from "@/infrastructure/persistence/jsonFileIO";

function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "character"
  );
}

export function exportCharacterToFile(character: PlayerCharacter, companions: Companion[]): void {
  const linkedCompanions = companions.filter((c) => character.companions.some((link) => link.companionId === c.id));

  const saveFile: CharacterSaveFile = {
    schemaVersion: 1,
    kind: "pf1-character-save",
    exportedAt: new Date().toISOString(),
    character,
    companions: linkedCompanions,
  };

  downloadJson(saveFile, `${slugify(character.name)}.pf1.json`);
}
