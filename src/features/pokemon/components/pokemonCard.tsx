// This shows a card for each Pokemon with its image, name, and number or id.

import Image from "next/image";
import { PokemonCardData } from "../types";
import { formatPokemonId } from "../../../lib/idFormatter";

export function PokemonCard({ pokemon, onClick }: { pokemon: PokemonCardData; onClick?: (pokemon: PokemonCardData) => void; }) {
  return (
    <li onClick={()=> onClick?.(pokemon)} className="flex items-center bg-[#480101] w-full px-5 py-2 hover:bg-[#700808] transition-colors border border-[#700808] cursor-pointer">
        <Image
            src={pokemon.icon ? pokemon.icon : "/pokeball.png"}
            alt={`${pokemon.id} ${pokemon.name} icon`}
            width={64}
            height={64}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/pokeball.png"; // Fallback image
            }}
        />

        <p className="text-md mr-auto">
            <strong>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</strong>
        </p>

        <span className="text-sm">{formatPokemonId(pokemon.id)}</span>
    </li>
  );
}