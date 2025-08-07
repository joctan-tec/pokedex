// A function to format Pokémon IDs

// Receives a Pokémon ID and returns it as a string with leading zeros
// e.g., 1 becomes "001", 25 becomes "025", and 123 becomes "123". After 999, it will return the ID as is.

export function formatPokemonId(id: number): string {
  if (id < 1) {
    throw new Error("ID must be a positive integer");
  }
  return "#"+id.toString().padStart(3, '0');
}