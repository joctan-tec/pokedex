"use client";

import { useEffect, useState, useRef, useCallback, use } from "react";
import {
  fetchPokemons,
  fetchPokemonByUrl,
  fetchPokemonsByIds,
} from "../features/pokemon/service";
import {
  PokemonCardData,
  PokemonDetailWithEvolutionResponse,
} from "../features/pokemon/types";
import { PokemonScrollList } from "../features/pokemon/components/pokemonScrollList";
import { PokemonInformation } from "../features/pokemon/components/pokemonInformation";
import { fullTextSearch } from "@/lib/searchPokemons";

export default function Home() {
  const [pokemons, setPokemons] = useState<PokemonCardData[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const [selectedPokemon, setSelectedPokemon] =
    useState<PokemonDetailWithEvolutionResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PokemonCardData[]>([]);

  const handlePokemonClick = (pokemon: PokemonCardData) => {
    setLoading(true);
    setSelectedPokemonByUrl(pokemon.url);
    setLoading(false);
  };

  const handleSearch = async (query: string) => {
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }
    const ids: { key: string; value: number }[] = fullTextSearch(query);
    if (ids.length === 0) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await fetchPokemonsByIds(ids.map((id) => id.value));
      setSearchResults(results);
      if (results.length > 0) {
        setSelectedPokemonByUrl(results[0].url);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    }
  };

  const observerRef = useRef<HTMLLIElement | null>(null);

  const setSelectedPokemonByUrl = async (url: string) => {
    try {
      const pokemon = await fetchPokemonByUrl(url);
      if (!pokemon) {
        console.error("No se pudo obtener la información del Pokémon.");
        return;
      }
      setSelectedPokemon(pokemon);
    } catch (error) {
      console.error("Error fetching selected Pokémon:", error);
    }
  };

  const loadMorePokemons = useCallback(async () => {
    if (loading || !hasMore || searchQuery !== "") return;

    setLoading(true);
    try {
      const newPokemons = await fetchPokemons({ limit, offset });
      setPokemons((prev) => [...prev, ...newPokemons]);
      setOffset((prev) => prev + limit);
      if (newPokemons.length < limit) setHasMore(false);

      if (offset === 0) {
        // Set the first Pokémon as selected when the list is first loaded
        setSelectedPokemonByUrl(newPokemons[0]?.url || "");
      }
    } catch (error) {
      console.error("Error loading pokemons:", error);
    } finally {
      setLoading(false);
    }
  }, [offset, loading, hasMore, searchQuery]);

  useEffect(() => {
    loadMorePokemons(); // initial load
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePokemons();
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [loadMorePokemons]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      await handleSearch(searchQuery);
    };
    fetchSearchResults();
  }, [searchQuery, pokemons]);

  return (
    <div className="bg-[#E33F3F] text-white font-sans flex flex-col items-center w-full h-screen p-5">
      <div className="flex w-full h-full gap-3">
        <PokemonScrollList
          pokemons={searchQuery == "" ? pokemons : searchResults}
          loaderRef={observerRef}
          onClick={handlePokemonClick}
          searchQuery={searchQuery}
        />
        <PokemonInformation
          pokemon={selectedPokemon}
          isLoading={loading}
          setQuery={setSearchQuery}
        />
      </div>
    </div>
  );
}
