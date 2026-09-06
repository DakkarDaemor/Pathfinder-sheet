/**
 * The game data (equipment weights, carrying-capacity tables, speed/encumbrance tables) is
 * kept internally in the Core Rulebook's native units (feet, pounds) because those tables are
 * calibrated to exact RAW values (e.g. the encumbered-speed lookup isn't a flat 2/3 of base
 * speed). These helpers convert only at the display boundary so the app can always show — and
 * accept input in — the metric system, regardless of the units the underlying rules use.
 */
const METERS_PER_FOOT = 0.3048;
const KG_PER_POUND = 0.45359237;

export function feetToMeters(feet: number): number {
  return feet * METERS_PER_FOOT;
}

export function metersToFeet(meters: number): number {
  return meters / METERS_PER_FOOT;
}

export function poundsToKg(pounds: number): number {
  return pounds * KG_PER_POUND;
}

export function kgToPounds(kg: number): number {
  return kg / KG_PER_POUND;
}

/** Rounds to 1 decimal place for display (e.g. carrying capacity, distances). */
export function roundMetric(value: number): number {
  return Math.round(value * 10) / 10;
}
