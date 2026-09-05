import { rosterSnapshotSchema, type RosterSnapshot } from "./saveFileSchema";

const STORAGE_KEY = "pathfinder-sheet.roster.v1";

export interface RosterRepository {
  load(): RosterSnapshot | null;
  save(snapshot: RosterSnapshot): void;
  clear(): void;
}

/**
 * Autosave adapter. Reads/writes are wrapped defensively: a corrupted or foreign value in
 * localStorage must never crash the app, it should just be treated as "nothing saved yet".
 */
export const localStorageRosterRepository: RosterRepository = {
  load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = rosterSnapshotSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  },

  save(snapshot) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Storage unavailable/full: autosave is a convenience, not the only save path (export JSON is).
    }
  },

  clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
