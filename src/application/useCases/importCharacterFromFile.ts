import { characterSaveFileSchema, type CharacterSaveFile } from "@/infrastructure/persistence/saveFileSchema";
import { pickAndReadJsonFile } from "@/infrastructure/persistence/jsonFileIO";

export class InvalidSaveFileError extends Error {}

export function parseCharacterSaveFile(raw: unknown): CharacterSaveFile {
  const result = characterSaveFileSchema.safeParse(raw);
  if (!result.success) {
    throw new InvalidSaveFileError(result.error.message);
  }
  return result.data;
}

/** Opens a file picker and returns the validated save file, or throws InvalidSaveFileError. */
export async function importCharacterFromFile(): Promise<CharacterSaveFile> {
  const raw = await pickAndReadJsonFile();
  return parseCharacterSaveFile(raw);
}
