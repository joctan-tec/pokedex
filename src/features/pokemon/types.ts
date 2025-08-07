// src/features/pokemon/types.ts

// 1. Interfaz base común
export interface BasePokemon {
  id: number;
  url: string;
  name: string;
  icon: string;
  officialArtwork: string;
}

// 2. Interfaz para el tipo del Pokémon
export interface PokemonType {
  type: {
    name: string;
  };
}

// 3. Interfaz de información detallada
export interface PokemonInformation {
  weight: number;
  height: number;
  species: string;
  eggGroups: string[];
  abilities: string[];
}



// 4. Interfaz completa de Pokémon
export interface Pokemon extends BasePokemon {
  types: PokemonType[];
  information: PokemonInformation;
  evolutions: BasePokemon[]; // reutilizamos la interfaz base para evoluciones
}

// 5. Interfaz para solo la Card (solo lo necesario)
export type PokemonCardData = BasePokemon;

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonEvolutionAndEggGroup {
  evolutions: BasePokemon[];
  eggGroups: string[];
}
  

export interface PokemonDetailResponse extends BasePokemon {
  types: PokemonType[];
  weight: number;
  height: number;
  species: {
    name: string;
    url: string;
  };
  eggGroups: string[];
  abilities: { ability: { name: string } }[];
  sprites: {
    front_default: string;
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
}

export interface PokemonDetailWithEvolutionResponse extends PokemonDetailResponse {
  evolutions: BasePokemon[];
  eggGroups: string[];
}


