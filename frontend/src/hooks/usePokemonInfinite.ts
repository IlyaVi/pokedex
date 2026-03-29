import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchPokemon } from "@/lib/api";

interface Params {
  page_size: number;
  order: "asc" | "desc";
  type?: string | null;
  search?: string | null;
  startPage?: number;
}

export function usePokemonInfinite({ startPage = 1, ...params }: Params) {
  return useInfiniteQuery({
    queryKey: ["pokemon-infinite", params],
    queryFn: ({ pageParam }) =>
      fetchPokemon({ page: pageParam as number, ...params }),
    initialPageParam: startPage,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.page_size);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      return firstPage.page > 1 ? firstPage.page - 1 : undefined;
    },
    placeholderData: keepPreviousData,
  });
}
