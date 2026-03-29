import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { createWrapper } from "../utils";
import { usePokemon } from "@/hooks/usePokemon";
import { makePage } from "../mocks/data";

describe("usePokemon", () => {
  it("fetches first page on mount", async () => {
    const { result } = renderHook(
      () => usePokemon({ page: 1, page_size: 10, order: "asc" }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.page).toBe(1);
    expect(result.current.data?.results.length).toBeGreaterThan(0);
  });

  it("isLoading is true during fetch", () => {
    const { result } = renderHook(
      () => usePokemon({ page: 1, page_size: 10, order: "asc" }),
      { wrapper: createWrapper() },
    );
    expect(result.current.isLoading).toBe(true);
  });

  it("refetches when params change", async () => {
    server.use(
      http.get("/api/pokemon", ({ request }) => {
        const url = new URL(request.url);
        const order = url.searchParams.get("order");
        return HttpResponse.json({ ...makePage(1, 10), _order: order });
      }),
    );

    const { result, rerender } = renderHook<
      ReturnType<typeof usePokemon>,
      { order: "asc" | "desc" }
    >(
      ({ order }) => usePokemon({ page: 1, page_size: 10, order }),
      { wrapper: createWrapper(), initialProps: { order: "asc" } },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ order: "desc" as const });
    await waitFor(() => {
      const raw = result.current.data as unknown as Record<string, unknown>;
      expect(raw._order).toBe("desc");
    });
  });

  it("sets isError on API failure", async () => {
    server.use(
      http.get("/api/pokemon", () => HttpResponse.error()),
    );
    const { result } = renderHook(
      () => usePokemon({ page: 1, page_size: 10, order: "asc" }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("handles empty results without error", async () => {
    server.use(
      http.get("/api/pokemon", () =>
        HttpResponse.json({ total: 0, page: 1, page_size: 10, results: [] }),
      ),
    );
    const { result } = renderHook(
      () => usePokemon({ page: 1, page_size: 10, order: "asc" }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total).toBe(0);
    expect(result.current.data?.results).toEqual([]);
  });
});
