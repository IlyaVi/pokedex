import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useIsMutating } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PokemonCard, PokemonCardSkeleton } from "@/components/PokemonCard";
import { usePokemonInfinite } from "@/hooks/usePokemonInfinite";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import type { SortOrder, PageSize } from "@/types";

const ROW_HEIGHT = 72;
const OVERSCAN = 10;

interface PokemonListProps {
  pageSize: PageSize;
  order: SortOrder;
  type: string | null;
  search: string;
}

export function PokemonList({ pageSize, order, type, search }: PokemonListProps) {
  const { savedIndex, setSavedIndex } = useScrollPosition();
  const isCapturing = useIsMutating({ mutationKey: ["capture"] }) > 0;
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingRestore = useRef<number>(savedIndex);
  const [restoring, setRestoring] = useState(savedIndex > 0);

  // --- Synchronous filter-change detection (runs during render) ---
  // Must be synchronous so startPage is correct on the same render
  // the queryKey changes — otherwise initialPageParam would be stale.
  const prevFilters = useRef({ order, type, search, pageSize });
  if (
    prevFilters.current.order !== order ||
    prevFilters.current.type !== type ||
    prevFilters.current.search !== search ||
    prevFilters.current.pageSize !== pageSize
  ) {
    pendingRestore.current = 0;
  }

  const startPage =
    pendingRestore.current > 0
      ? Math.floor(pendingRestore.current / pageSize) + 1
      : 1;

  const {
    data, isLoading, isError, isFetching,
    fetchNextPage, hasNextPage, isFetchingNextPage,
    fetchPreviousPage, hasPreviousPage, isFetchingPreviousPage,
  } = usePokemonInfinite({ page_size: pageSize, order, type, search, startPage });

  // Side-effects for filter reset (localStorage, DOM, state).
  useEffect(() => {
    const prev = prevFilters.current;
    prevFilters.current = { order, type, search, pageSize };
    if (prev.order === order && prev.type === type && prev.search === search && prev.pageSize === pageSize) return;
    setSavedIndex(0);
    setRestoring(false);
    if (containerRef.current) containerRef.current.scrollTop = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, type, search, pageSize]);

  // --- Derived data ---
  const allPokemon = data?.pages.flatMap((p) => p.results) ?? [];
  const firstPageParam = (data?.pageParams?.[0] as number | undefined) ?? startPage;
  const globalOffset = (firstPageParam - 1) * pageSize;
  const globalOffsetRef = useRef(globalOffset);
  globalOffsetRef.current = globalOffset;

  const rowCount = allPokemon.length + (hasNextPage || isFetchingNextPage ? 1 : 0);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  // --- Save global index on scroll (rAF-throttled) ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setSavedIndex(globalOffsetRef.current + Math.floor(el.scrollTop / ROW_HEIGHT));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, [setSavedIndex]);

  // --- Restore scroll position ---
  // May need one extra page fetch if the target item is near the end of
  // the loaded data and the scroll container isn't tall enough to reach it.
  useEffect(() => {
    if (isLoading || isFetchingNextPage) return;
    if (pendingRestore.current === 0) {
      if (restoring) setRestoring(false);
      return;
    }

    const localIndex = pendingRestore.current - globalOffset;
    if (localIndex >= 0 && localIndex < allPokemon.length) {
      const el = containerRef.current;
      const maxScroll = rowCount * ROW_HEIGHT - (el?.clientHeight ?? 0);
      if (localIndex * ROW_HEIGHT > maxScroll && hasNextPage) {
        void fetchNextPage();
        return;
      }
      pendingRestore.current = 0;
      requestAnimationFrame(() => {
        virtualizer.scrollToIndex(localIndex, { align: "start" });
        requestAnimationFrame(() => setRestoring(false));
      });
    } else {
      pendingRestore.current = 0;
      setRestoring(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isFetchingNextPage]);

  // --- Adjust scrollTop when previous pages are prepended ---
  const prevFirstPage = useRef<number | undefined>(undefined);
  useLayoutEffect(() => {
    if (prevFirstPage.current !== undefined && firstPageParam < prevFirstPage.current) {
      const pagesAdded = prevFirstPage.current - firstPageParam;
      const el = containerRef.current;
      if (el) el.scrollTop += pagesAdded * pageSize * ROW_HEIGHT;
    }
    prevFirstPage.current = firstPageParam;
  }, [firstPageParam, pageSize]);

  // --- Bidirectional infinite scroll triggers ---
  const virtualItems = virtualizer.getVirtualItems();
  const firstVirtualItem = virtualItems[0];
  const lastVirtualItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!firstVirtualItem) return;
    if (firstVirtualItem.index === 0 && hasPreviousPage && !isFetchingPreviousPage) {
      void fetchPreviousPage();
    }
  }, [firstVirtualItem?.index, hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage]);

  useEffect(() => {
    if (!lastVirtualItem) return;
    if (lastVirtualItem.index >= allPokemon.length - 1 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [lastVirtualItem, allPokemon.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // --- Render ---
  const isRefetching = isFetching && !isFetchingNextPage && !isFetchingPreviousPage;
  const showOverlay = isRefetching || isCapturing || restoring;

  if (isError) {
    return <p className="text-center text-destructive py-12">Failed to load Pokémon. Please try again.</p>;
  }

  if (!isLoading && !restoring && allPokemon.length === 0) {
    return <p className="text-center text-muted-foreground py-12">No Pokémon found. Try adjusting the filters.</p>;
  }

  return (
    <div className="rounded-lg border overflow-hidden flex flex-col relative" style={{ height: "calc(100vh - 140px)" }}>
      {showOverlay && (
        <div className={`absolute inset-0 z-10 flex items-center justify-center ${restoring ? "bg-background" : "bg-background/40 backdrop-blur-sm"}`}>
          <div className="w-10 h-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
        </div>
      )}

      <div className="hidden sm:grid grid-cols-[3rem_8rem_9rem_1fr_6rem] gap-4 px-4 py-2 bg-muted/60 text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">
        <span /><span>Pokémon</span><span>Type</span><span>Stats</span><span />
      </div>

      <div ref={containerRef} className="overflow-y-auto flex-1">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const pokemon = allPokemon[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                style={{ position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${virtualRow.start}px)`, height: `${virtualRow.size}px` }}
              >
                {pokemon ? <PokemonCard pokemon={pokemon} /> : <PokemonCardSkeleton />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
