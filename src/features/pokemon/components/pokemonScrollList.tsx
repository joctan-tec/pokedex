// features/pokemon/components/pokemonScrollList.tsx
import { PokemonCard } from "./pokemonCard";
import { PokemonCardData } from "../types";
import { RefObject } from "react";

export function PokemonScrollList({
  pokemons,
  loaderRef,
  onClick,
  searchQuery,
}: {
  pokemons: PokemonCardData[];
  loaderRef: RefObject<HTMLLIElement | null>;
  onClick?: (pokemon: PokemonCardData) => void;
  searchQuery?: string;
}) {

  const handlePokemonClick = (pokemon: PokemonCardData) => {
    onClick?.(pokemon);
  };


  return (
    <div className="w-3/12 border-2 border-[#FF8585] rounded-lg h-full">
      <ul className="flex flex-col w-full h-full overflow-y-auto rounded-lg">
        {pokemons.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} onClick={handlePokemonClick} />
        ))}
        <li ref={loaderRef} className="py-4 text-center text-sm text-white/60">
          {searchQuery !== "" ? "" : "Loading more Pokémon..."}
        </li>
      </ul>
    </div>
  );
}
