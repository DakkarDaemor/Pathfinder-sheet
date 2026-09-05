import { useTranslation } from "react-i18next";
import type { PlayerCharacter } from "@/domain/character/types";
import { TextArea } from "@/presentation/components/fields";

interface NotesTabProps {
  character: PlayerCharacter;
  onChange: (updater: (character: PlayerCharacter) => PlayerCharacter) => void;
}

export function NotesTab({ character, onChange }: NotesTabProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{t("characterSheet.notes.heading")}</h3>
      <TextArea
        rows={12}
        placeholder={t("characterSheet.notes.placeholder")}
        value={character.notes}
        onChange={(e) => onChange((c) => ({ ...c, notes: e.target.value }))}
        className="w-full"
      />
    </div>
  );
}
