import Pokemons from "./search_pokemons.json";

export function fullTextSearch(query: string): { key: string; value: number }[] {
  const data: { [key: string]: number } = Pokemons;
  const normalizedQuery = query.toLowerCase().trim();

  // Si el string está vacío, devolvemos todo
  if (!normalizedQuery) {
    return Object.entries(data).map(([key, value]) => ({ key, value }));
  }

  // Clasificamos en tres grupos por relevancia
  const exact: { key: string; value: number }[] = [];
  const startsWith: { key: string; value: number }[] = [];
  const includes: { key: string; value: number }[] = [];

  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = key.toLowerCase();

    if (normalizedKey === normalizedQuery) {
      exact.push({ key, value });
    } else if (normalizedKey.startsWith(normalizedQuery)) {
      startsWith.push({ key, value });
    } else if (normalizedKey.includes(normalizedQuery)) {
      includes.push({ key, value });
    }
  }

  // Orden por relevancia: exact > startsWith > includes
  return [...exact, ...startsWith, ...includes];
}

// Uses a simple JSON file as a mock database
// Returns the value associated with the key or null if not found
export function getPokemonByKey(key: string): number | null {
    const data: { [key: string]: number } = Pokemons;
    return data[key] || null;
};