import { SearchBar } from "@/components/shared/searchBar";
import { Pokemon, PokemonDetailWithEvolutionResponse } from "../types";
import Image from "next/image";
import { fullTextSearch } from "@/lib/searchPokemons";


export function PokemonInformation({ pokemon, isLoading, setQuery }: { pokemon: PokemonDetailWithEvolutionResponse | null; isLoading: boolean ; setQuery?: (query: string) => void }) {

  if (!pokemon) {
    return (
      <div className="w-9/12 flex flex-col items-center border-2 border-[#FF8585] bg-[#FFFFFF] rounded-lg overflow-y-auto h-full px-5">
        <p className="text-gray-500 mt-10">{isLoading ? "Loading Pokémon information..." : "Select a Pokémon to see its details."}</p>
      </div>
    );
  }

  
  const handleSearch = (query: string) => {
    setQuery?.(query);
  };

  const handleDebouncedSearch = (query: string) => {
    setQuery?.(query);
  };
  

  return (
    isLoading ? (
      <div className="w-9/12 flex flex-col items-center border-2 border-[#FF8585] bg-[#FFFFFF] rounded-lg overflow-y-auto h-full px-5">
        <p className="text-gray-500 mt-10">Loading Pokémon information...</p>
      </div>
    ) : (
      <div className="w-9/12 flex flex-col items-center border-2 border-[#FF8585] bg-[#FFFFFF] rounded-lg overflow-y-auto h-full px-5">
        <div className="w-full flex items-center justify-end mt-3">
          <SearchBar
            onSearch={handleSearch}
            onDebouncedSearch={handleDebouncedSearch}
          />
        </div>

        {/*Pokemons Information*/}
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="w-full flex gap-5">
            {/* Pokemon Image, Name and Types */}
            <div className="w-1/2 flex flex-col items-center">
              <Image
                src={pokemon.officialArtwork}
                alt={`${pokemon.name} official artwork`}
                width={200}
                height={200}
              />

              <h1 className="text-[#000000] text-2xl font-semibold mt-6">
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </h1>

              <div className="w-full justify-center flex gap-2 mt-6">
                {pokemon.types.map((type) => (
                  <span
                    key={type.type.name}
                    className={`bg-[#F8E6E6] text-sm font-medium text-[#000000] px-12 py-1 rounded-md`}
                  >
                    {type.type.name.charAt(0).toUpperCase() +
                      type.type.name.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {/* Pokemon Information */}
            <div className="w-1/2 flex flex-col justify-center text-[#000000] gap-4">
              <h2 className="font-semibold text-xl mb-8">Information</h2>

              <p className="text-sm">
                <strong>Weight </strong>
                {pokemon.weight} lbs.
              </p>
              <p className="text-sm">
                <strong>Height: </strong>
                {pokemon.height}
              </p>
              <p className="text-sm">
                <strong>Species: </strong>
                {pokemon.species.name.charAt(0).toUpperCase() + pokemon.species.name.slice(1)}
              </p>
              <p className="text-sm">
                <strong>Egg Groups: </strong>
                {pokemon.eggGroups.map((group) => group.charAt(0).toUpperCase() + group.slice(1)).join(", ")}
              </p>
              <p className="text-sm">
                <strong>Abilities: </strong>
                {pokemon.abilities.map((ability) => ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1)).join(", ")}
              </p>
            </div>
          </div>
          {/* Evolution Chart */}
          <div className="w-full border-1 border-[#E23F3F] mt-5"></div>

          <div className="w-full flex flex-col items-center mt-5">
            <h2 className="font-semibold text-xl mb-8 text-[#000000]">
              Evolution Chart
            </h2>

            <div className="w-full flex justify-around items-center">
              {pokemon.evolutions.length > 0 ? (
                pokemon.evolutions.map((evolution, index) => (
                  <div key={evolution.id} style={{ display: "contents" }}>
                    <div className="flex flex-col items-center">
                      <Image
                        src={evolution.officialArtwork}
                        alt={`${evolution.name} official artwork`}
                        width={128}
                        height={128}
                        className="w-32 h-32"
                      />
                      <p className="text-sm text-[#000000]">
                        {evolution.name.charAt(0).toUpperCase() +
                          evolution.name.slice(1)}
                      </p>
                    </div>

                    {index < pokemon.evolutions.length - 1 && (
                      <Image
                          src="/arrow.svg"
                          alt="evolution arrow"
                          width={40}
                          height={40}
                        />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No evolutions available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
}
