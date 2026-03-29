import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchPokemon } from "@/lib/api";

interface Params {
  page_size: number;
  order: "asc" | "desc";
  type?: string | null;
  search?: string | null;
}

export function usePokemonInfinite(params: Params) {
  return useInfiniteQuery({
    queryKey: ["pokemon-infinite", params],
    queryFn: ({ pageParam }) =>
      fetchPokemon({ page: pageParam as number, ...params }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.page_size);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    placeholderData: keepPreviousData,
  });
}
