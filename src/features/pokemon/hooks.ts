import { useEffect, useState, useRef, useCallback } from "react";
import { fetchPokemons } from "./service";
import { PokemonListResponse, PokemonCardData } from "./types";

export const useInfinitePokemonScroll = () => {
  const [loading, setLoading] = useState(false);
  const [pokemons, setPokemons] = useState<PokemonCardData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const limit = 20;

  const loadPokemons = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const data = await fetchPokemons({ limit, offset });
      if (data.length < limit) {
        setHasMore(false);
      }
      setPokemons((prev) => [...prev, ...data]);
      setOffset((prev) => prev + limit);
    } catch (error) {
      console.error("Error fetching Pokémon data:", error);
    }
    setLoading(false);
  }, [loading, hasMore, offset]);

  return {
    pokemons,
    loading,
    hasMore,
    loadPokemons,
  };
};
