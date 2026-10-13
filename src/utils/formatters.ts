/**
 * Formats a Pokémon ID with a leading '#' and padded to 4 digits.
 * Example: 25 -> "#0025", 1 -> "#0001"
 */
export function formatPokemonId(id: number): string {
  return `#${id.toString().padStart(4, '0')}`;
}

/**
 * Capitalizes a string and replaces hyphens with spaces.
 * Example: "mr-mime" -> "Mr Mime", "pikachu" -> "Pikachu"
 */
export function formatPokemonName(name: string): string {
  if (!name) return '';
  return name
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Converts Pokémon height in decimeters to meters in pt-BR format.
 * Example: 7 decimeters -> "0,7 m"
 */
export function formatHeight(heightInDecimeters: number): string {
  const meters = heightInDecimeters / 10;
  // Use toFixed with comma replacement to ensure consistent pt-BR decimal separator across all engines
  return `${meters.toFixed(1).replace('.', ',')} m`;
}

/**
 * Converts Pokémon weight in hectograms to kilograms in pt-BR format.
 * Example: 69 hectograms -> "6,9 kg"
 */
export function formatWeight(weightInHectograms: number): string {
  const kilograms = weightInHectograms / 10;
  return `${kilograms.toFixed(1).replace('.', ',')} kg`;
}

/**
 * Formats ability name with capitalization and hyphen replacement.
 * Example: "solar-power" -> "Solar Power"
 */
export function formatAbilityName(name: string): string {
  return formatPokemonName(name);
}
