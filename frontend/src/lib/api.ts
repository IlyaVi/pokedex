import type { PokemonListResponse } from "@/types";

const BASE = "/api";

export interface FetchPokemonParams {
  page: number;
  page_size: number;
  order: "asc" | "desc";
  type?: string | null;
  search?: string | null;
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchPokemon(params: FetchPokemonParams): Promise<PokemonListResponse> {
  const url = new URL(`${BASE}/pokemon`, window.location.origin);
  url.searchParams.set("page", String(params.page));
  url.searchParams.set("page_size", String(params.page_size));
  url.searchParams.set("order", params.order);
  if (params.type) url.searchParams.set("type", params.type);
  if (params.search) url.searchParams.set("search", params.search);
  return request<PokemonListResponse>(url.toString());
}

export function fetchTypes(): Promise<string[]> {
  return request<string[]>(`${BASE}/pokemon/types`);
}

export function fetchCaptured(): Promise<{ captured_ids: number[] }> {
  return request<{ captured_ids: number[] }>(`${BASE}/captured`);
}

export function capturePokemon(number: number): Promise<{ captured: boolean }> {
  return request<{ captured: boolean }>(`${BASE}/pokemon/${number}/capture`, {
    method: "POST",
  });
}

export function releasePokemon(number: number): Promise<{ captured: boolean }> {
  return request<{ captured: boolean }>(`${BASE}/pokemon/${number}/capture`, {
    method: "DELETE",
  });
}
