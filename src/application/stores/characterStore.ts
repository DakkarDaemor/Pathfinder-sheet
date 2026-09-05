import { create } from "zustand";
import type { PlayerCharacter } from "@/domain/character/types";
import type { Companion } from "@/domain/companion/types";
import { localStorageRosterRepository } from "@/infrastructure/persistence/localStorageRepository";
import type { RosterSnapshot } from "@/infrastructure/persistence/saveFileSchema";

interface RosterSlice {
  characters: PlayerCharacter[];
  companions: Companion[];
}

interface CharacterState extends RosterSlice {
  addCharacter: (character: PlayerCharacter) => void;
  updateCharacter: (id: string, updater: (character: PlayerCharacter) => PlayerCharacter) => void;
  removeCharacter: (id: string) => void;
  addCompanion: (companion: Companion) => void;
  updateCompanion: (id: string, updater: (companion: Companion) => Companion) => void;
  removeCompanion: (id: string) => void;
  /** Used by the import use-case: adds/replaces a character plus the companions it links to. */
  upsertCharacterWithCompanions: (character: PlayerCharacter, companions: Companion[]) => void;
}

function persist(slice: RosterSlice): void {
  const snapshot: RosterSnapshot = { schemaVersion: 1, characters: slice.characters, companions: slice.companions };
  localStorageRosterRepository.save(snapshot);
}

const initialSnapshot = localStorageRosterRepository.load();

export const useCharacterStore = create<CharacterState>((set) => ({
  characters: initialSnapshot?.characters ?? [],
  companions: initialSnapshot?.companions ?? [],

  addCharacter(character) {
    set((state) => {
      const next: RosterSlice = { characters: [...state.characters, character], companions: state.companions };
      persist(next);
      return next;
    });
  },

  updateCharacter(id, updater) {
    set((state) => {
      const characters = state.characters.map((c) => (c.id === id ? updater(c) : c));
      const next: RosterSlice = { characters, companions: state.companions };
      persist(next);
      return next;
    });
  },

  removeCharacter(id) {
    set((state) => {
      const character = state.characters.find((c) => c.id === id);
      const linkedIds = new Set((character?.companions ?? []).map((link) => link.companionId));
      const next: RosterSlice = {
        characters: state.characters.filter((c) => c.id !== id),
        companions: state.companions.filter((comp) => !linkedIds.has(comp.id)),
      };
      persist(next);
      return next;
    });
  },

  addCompanion(companion) {
    set((state) => {
      const next: RosterSlice = { characters: state.characters, companions: [...state.companions, companion] };
      persist(next);
      return next;
    });
  },

  updateCompanion(id, updater) {
    set((state) => {
      const companions = state.companions.map((c) => (c.id === id ? updater(c) : c));
      const next: RosterSlice = { characters: state.characters, companions };
      persist(next);
      return next;
    });
  },

  removeCompanion(id) {
    set((state) => {
      const next: RosterSlice = {
        characters: state.characters.map((ch) => ({
          ...ch,
          companions: ch.companions.filter((link) => link.companionId !== id),
        })),
        companions: state.companions.filter((c) => c.id !== id),
      };
      persist(next);
      return next;
    });
  },

  upsertCharacterWithCompanions(character, companions) {
    set((state) => {
      const otherCompanions = state.companions.filter((c) => !companions.some((imported) => imported.id === c.id));
      const next: RosterSlice = {
        characters: [...state.characters.filter((c) => c.id !== character.id), character],
        companions: [...otherCompanions, ...companions],
      };
      persist(next);
      return next;
    });
  },
}));
