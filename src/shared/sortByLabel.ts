/** Sorts a copy of `items` alphabetically by a locale-aware display label (e.g. a translated name). */
export function sortByLabel<T>(items: T[], labelOf: (item: T) => string): T[] {
  return [...items].sort((a, b) => labelOf(a).localeCompare(labelOf(b)));
}
