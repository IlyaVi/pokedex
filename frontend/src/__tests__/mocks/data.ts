import type { Pokemon, PokemonListResponse } from "@/types";

export const MOCK_POKEMON: Pokemon[] = Array.from({ length: 12 }, (_, i) => ({
  number: i + 1,
  name: `Pokemon${i + 1}`,
  types: i % 3 === 0 ? ["fire"] : i % 3 === 1 ? ["water"] : ["grass"],
  total: 300 + i * 10,
  hit_points: 40 + i,
  attack: 50 + i,
  defense: 45 + i,
  special_attack: 55 + i,
  special_defense: 50 + i,
  speed: 60 + i,
  generation: 1,
  legendary: false,
  image_url: `https://img.pokemondb.net/sprites/silver/normal/pokemon${i + 1}.png`,
  captured: false,
}));

export function makePage(
  page: number,
  pageSize: number,
  pokemon = MOCK_POKEMON,
): PokemonListResponse {
  const total = pokemon.length;
  const start = (page - 1) * pageSize;
  return {
    total,
    page,
    page_size: pageSize,
    results: pokemon.slice(start, start + pageSize),
  };
}
