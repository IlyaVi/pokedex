import { useQuery } from "@tanstack/react-query";
import { fetchPokemon } from "@/lib/api";
import type { FetchPokemonParams } from "@/lib/api";

export function usePokemon(params: FetchPokemonParams) {
  return useQuery({
    queryKey: ["pokemon", params],
    queryFn: () => fetchPokemon(params),
    placeholderData: (prev) => prev,
  });
}
