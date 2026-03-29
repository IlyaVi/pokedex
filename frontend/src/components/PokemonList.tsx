import { useEffect, useRef } from "react";
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
  const { data, isLoading, isError, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePokemonInfinite({ page_size: pageSize, order, type, search });

  const { savedIndex, setSavedIndex } = useScrollPosition();
  const isCapturing = useIsMutating({ mutationKey: ["capture"] }) > 0;

  const containerRef = useRef<HTMLDivElement>(null);
  // Item index we need to restore to — cleared once restore succeeds.
  const pendingRestore = useRef<number>(savedIndex);
  const isFirstMount = useRef(true);

  // Skip reset on first mount; reset when filters change.
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    pendingRestore.current = 0;
    setSavedIndex(0);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, type, search, pageSize]);

  const allPokemon = data?.pages.flatMap((p) => p.results) ?? [];
  const rowCount = allPokemon.length + (hasNextPage || isFetchingNextPage ? 1 : 0);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  // Save the first visible item index on scroll (rAF-throttled).
  // Derived from scrollTop / ROW_HEIGHT to avoid reading virtualizer state.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setSavedIndex(Math.floor(el.scrollTop / ROW_HEIGHT));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, [setSavedIndex]);

  // Restore visible index after each fetch settles:
  //   - if we have enough items → scrollToIndex
  //   - if not → fetch the next page and retry when it arrives
  useEffect(() => {
    if (isLoading || isFetchingNextPage) return;
    if (pendingRestore.current === 0) return;

    if (allPokemon.length > pendingRestore.current) {
      const target = pendingRestore.current;
      pendingRestore.current = 0;
      // rAF ensures the virtualizer has measured the new rows before scrolling
      requestAnimationFrame(() => {
        virtualizer.scrollToIndex(target, { align: "start" });
      });
    } else if (hasNextPage) {
      void fetchNextPage();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isFetchingNextPage]);

  // Trigger next-page load when virtualizer window reaches the last loaded item.
  const virtualItems = virtualizer.getVirtualItems();
  const lastVirtualItem = virtualItems[virtualItems.length - 1];
  useEffect(() => {
    if (!lastVirtualItem) return;
    if (lastVirtualItem.index >= allPokemon.length - 1 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [lastVirtualItem, allPokemon.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isRefetching = isFetching && !isFetchingNextPage;
  const showOverlay = isRefetching || isCapturing;

  if (isError) {
    return <p className="text-center text-destructive py-12">Failed to load Pokémon. Please try again.</p>;
  }

  if (!isLoading && allPokemon.length === 0) {
    return <p className="text-center text-muted-foreground py-12">No Pokémon found. Try adjusting the filters.</p>;
  }

  return (
    <div className="rounded-lg border overflow-hidden flex flex-col relative" style={{ height: "calc(100vh - 140px)" }}>
      {showOverlay && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-sm">
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
