import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { useDebounce } from "react-use";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FilterBar } from "@/components/FilterBar";
import { PokemonList } from "@/components/PokemonList";
import { fetchCaptured } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";
import type { SortOrder, PageSize } from "@/types";

const PAGE_SIZES = [5, 10, 20] as const;

export default function App() {
  useTheme();

  const [{ page_size, order, type }, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    page_size: parseAsInteger.withDefault(20),
    order: parseAsStringLiteral(["asc", "desc"] as const).withDefault("asc"),
    type: parseAsString.withDefault(""),
  });

  const [searchRaw, setSearchRaw] = useQueryState("search", parseAsString.withDefault(""));
  const [search, setSearch] = useState(searchRaw);

  // Debounce search: only push to URL (and thus change the query key) after 300 ms
  useDebounce(() => { void setSearchRaw(search || null); }, 300, [search]);

  useQuery({
    queryKey: ["captured-hydrate"],
    queryFn: fetchCaptured,
    staleTime: Infinity,
  });

  const handleOrderChange = useCallback(
    (value: SortOrder) => { void setParams({ order: value }); },
    [setParams],
  );

  const handleTypeChange = useCallback(
    (value: string | null) => { void setParams({ type: value ?? "" }); },
    [setParams],
  );

  const handlePageSizeChange = useCallback(
    (value: PageSize) => { void setParams({ page_size: value }); },
    [setParams],
  );

  const pageSize = (PAGE_SIZES.includes(page_size as PageSize) ? page_size : 20) as PageSize;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold tracking-tight">Pokédex</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <FilterBar
          order={order}
          onOrderChange={handleOrderChange}
          type={type || null}
          onTypeChange={handleTypeChange}
          search={search}
          onSearchChange={setSearch}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />

        <PokemonList
          pageSize={pageSize}
          order={order}
          type={type || null}
          search={searchRaw}
        />
      </main>

      <Toaster richColors />
    </div>
  );
}
