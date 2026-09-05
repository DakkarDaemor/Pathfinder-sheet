import type { PlayerCharacter } from "@/domain/character/types";
import { generateId } from "@/shared/id";

export function duplicateCharacter(source: PlayerCharacter, duplicateName: string): PlayerCharacter {
  const now = new Date().toISOString();
  return {
    ...source,
    id: generateId(),
    name: duplicateName,
    companions: [], // companions are not duplicated: they'd need their own new ids/links
    createdAt: now,
    updatedAt: now,
  };
}
