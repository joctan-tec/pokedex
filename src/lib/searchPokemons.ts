import Pokemons from "./search_pokemons.json";

export function fullTextSearch(query: string): { key: string; value: number }[] {
  const data: { [key: string]: number } = Pokemons;
  const normalizedQuery = query.toLowerCase().trim();

  // If the query is empty, return all entries
  if (!normalizedQuery) {
    return Object.entries(data).map(([key, value]) => ({ key, value }));
  }

  // Categorize results based on how they match the query
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

  return [...exact, ...startsWith, ...includes];
}


export function getPokemonByKey(key: string): number | null {
    const data: { [key: string]: number } = Pokemons;
    return data[key] || null;
};