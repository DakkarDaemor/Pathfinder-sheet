import { useParams } from "react-router-dom";
import { useCharacterStore } from "@/application/stores/characterStore";
import type { PlayerCharacter } from "@/domain/character/types";

export function useCharacterEditor() {
  const { id } = useParams<{ id: string }>();
  const character = useCharacterStore((s) => s.characters.find((c) => c.id === id));
  const updateCharacterInStore = useCharacterStore((s) => s.updateCharacter);

  function update(updater: (character: PlayerCharacter) => PlayerCharacter): void {
    if (!id) return;
    updateCharacterInStore(id, (c) => ({ ...updater(c), updatedAt: new Date().toISOString() }));
  }

  return { characterId: id, character, update };
}
