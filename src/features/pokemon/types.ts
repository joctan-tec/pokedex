// src/features/pokemon/types.ts


export interface BasePokemon {
  id: number;
  url: string;
  name: string;
  icon: string;
  officialArtwork: string;
}


export interface PokemonType {
  type: {
    name: string;
  };
}


export interface PokemonInformation {
  weight: number;
  height: number;
  species: string;
  eggGroups: string[];
  abilities: string[];
}


export interface Pokemon extends BasePokemon {
  types: PokemonType[];
  information: PokemonInformation;
  evolutions: BasePokemon[];
}


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


