import { PokemonListResponse, PokemonCardData, PokemonDetailResponse, PokemonDetailWithEvolutionResponse, PokemonListItem, BasePokemon, PokemonEvolutionAndEggGroup } from "./types";
import { getPokemonByKey } from "@/lib/searchPokemons";

export interface FetchPokemonsParams {
  limit?: number;
  offset?: number;
}

export const fetchPokemons = async ({ limit = 20, offset = 0 }: FetchPokemonsParams) : Promise<PokemonCardData[]> => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    if (!res.ok) {
        throw new Error("Error fetching Pokémon data");
    }
    const data: PokemonListResponse = await res.json();

    // Fetch detailed information for each Pokémon in the results
    const pokemonDetails = await fetchPokemonBasicDetails(data.results);
    if (!pokemonDetails || pokemonDetails.length === 0) {
        throw new Error("No Pokémon data found");
    }
    return pokemonDetails;
};

export const fetchPokemonsByIds = async (ids: number[]): Promise<PokemonCardData[]> => {
  if (!ids || ids.length === 0) {
    throw new Error("No Pokémon IDs provided");
  }
  const baseUrl = "https://pokeapi.co/api/v2/pokemon";
    const pokemonDetailsPromises = ids.map(async (id) => {
        if (id < 1) {
        throw new Error("ID must be a positive integer");
        }
        const res = await fetch(`${baseUrl}/${id}`);
        if (!res.ok) {
        throw new Error(`Error fetching Pokémon with ID ${id}`);
        }
        const data: PokemonDetailResponse = await res.json();
        return {
        id: data.id,
        name: data.name,
        url: `${baseUrl}/${data.id}`,
        icon: data.sprites.front_default,
        officialArtwork: data.sprites.other["official-artwork"].front_default,
        };
    });
    const pokemonDetails = await Promise.all(pokemonDetailsPromises);
    return pokemonDetails.filter(pokemon => pokemon !== null) as PokemonCardData[];
}



// Fetches detailed information for all Pokémon in the list
const fetchPokemonBasicDetails = async (pokemonList: PokemonListItem[]): Promise<PokemonCardData[]> => {
  const pokemonBasicDetailsPromises = pokemonList.map(async (pokemon) => {
    const res = await fetch(pokemon.url);
    if (!res.ok) {
      throw new Error(`Error fetching details for ${pokemon.name}`);
    }
    const data: PokemonDetailResponse = await res.json();
    return {
      id: data.id,
      name: data.name,
      url: pokemon.url,
      icon: data.sprites.front_default,
      officialArtwork: data.sprites.other["official-artwork"].front_default,
    };
  });

  return Promise.all(pokemonBasicDetailsPromises);
};

// Fetches detailed information for a single Pokémon by their URL
export const fetchPokemonByUrl = async (url: string): Promise<PokemonDetailWithEvolutionResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    
    throw new Error("Error fetching Pokémon details");
  }
  const data: PokemonDetailResponse = await res.json();

  const evolutionsAndEggGroups = await fetchPokemonEvolutions(data.species.url);
  
    return {
        id: data.id,
        name: data.name,
        url: url,
        icon: data.sprites.front_default,
        officialArtwork: data.sprites.other["official-artwork"].front_default,
        types: data.types,
        weight: data.weight,
        height: data.height,
        species: data.species,
        abilities: data.abilities,
        evolutions: evolutionsAndEggGroups.evolutions,
        sprites: data.sprites,
        eggGroups: evolutionsAndEggGroups.eggGroups,
    };
};

// Fetches detailed information for a single Pokémon by their ID
export const fetchPokemonById = async (id: number): Promise<BasePokemon> => {
  if (id < 1) {
    throw new Error("ID must be a positive integer");
  }
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) {
    throw new Error(`Error fetching Pokémon with ID ${id}`);
  }
  const data: PokemonDetailResponse = await res.json();
  
  return {
    id: data.id,
    name: data.name,
    url: data.url,
    icon: data.sprites.front_default,
    officialArtwork: data.sprites.other["official-artwork"].front_default,
  };
}

// Fetch evolution chain for a Pokémon
const fetchPokemonEvolutions = async (speciesUrl: string): Promise<PokemonEvolutionAndEggGroup> => {
    const res = await fetch(speciesUrl);
    if (!res.ok) {
        throw new Error("Error fetching Pokémon species data");
    }   
    const data = await res.json();
    const evolutionChainUrl = data.evolution_chain.url;
    let eggGroups: string[] = [];
    if (data.egg_groups) {
        data.egg_groups.forEach((group: { name: string }) => {
            eggGroups.push(group.name);
        });
    }
    
    // Fetch the evolution chain
    const evolutions: BasePokemon[] = await fetchEvolutionChain(evolutionChainUrl);
    return {
        evolutions: evolutions,
        eggGroups: eggGroups,
    };
    

};

const fetchEvolutionChain = async (url: string): Promise<BasePokemon[]> => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error("Error fetching evolution chain data");
    }
    const data = await res.json();
    
    // Extract evolutions from the chain
    const evolutions: BasePokemon[] = [];
    let currentEvolution = data.chain;

    while (currentEvolution){
        const pokemonId: number | null = getPokemonByKey(currentEvolution.species.name);
        if (pokemonId) {
            const pokemonData = await fetchPokemonById(pokemonId);
            evolutions.push(pokemonData);
        }
        if (currentEvolution.evolves_to.length > 0) {
            currentEvolution = currentEvolution.evolves_to[0];
        } else {
            currentEvolution = null;
        }

    
    }
    return evolutions;
};



