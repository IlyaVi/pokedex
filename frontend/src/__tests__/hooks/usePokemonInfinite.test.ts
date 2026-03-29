import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { createWrapper } from "../utils";
import { usePokemonInfinite } from "@/hooks/usePokemonInfinite";
import { makePage } from "../mocks/data";

const BASE_PARAMS = { page_size: 5, order: "asc" as const };

describe("usePokemonInfinite", () => {
  it("loads first page on mount", async () => {
    const { result } = renderHook(() => usePokemonInfinite(BASE_PARAMS), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages).toHaveLength(1);
    expect(result.current.data?.pages[0].page).toBe(1);
    expect(result.current.data?.pages[0].results).toHaveLength(5);
  });

  it("fetchNextPage appends a second page", async () => {
    const { result } = renderHook(() => usePokemonInfinite(BASE_PARAMS), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    act(() => { void result.current.fetchNextPage(); });
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2), {
      timeout: 3000,
    });
    expect(result.current.data?.pages[1].page).toBe(2);
  });

  it("hasNextPage is false on last page", async () => {
    server.use(
      http.get("/api/pokemon", () =>
        HttpResponse.json(makePage(1, 5, [
          { number: 1, name: "A", types: ["fire"], total: 300, hit_points: 40, attack: 50, defense: 45, special_attack: 55, special_defense: 50, speed: 60, generation: 1, legendary: false, image_url: "", captured: false },
          { number: 2, name: "B", types: ["water"], total: 310, hit_points: 41, attack: 51, defense: 46, special_attack: 56, special_defense: 51, speed: 61, generation: 1, legendary: false, image_url: "", captured: false },
        ])),
      ),
    );
    const { result } = renderHook(
      () => usePokemonInfinite({ ...BASE_PARAMS }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it("isFetchingNextPage becomes false after loading next page", async () => {
    const { result } = renderHook(() => usePokemonInfinite(BASE_PARAMS), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    act(() => { void result.current.fetchNextPage(); });
    // Wait until both pages are loaded — isFetchingNextPage must be false by then
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2), { timeout: 3000 });
    expect(result.current.isFetchingNextPage).toBe(false);
  });
});
