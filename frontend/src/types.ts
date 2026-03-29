export interface Pokemon {
  number: number;
  name: string;
  types: string[];
  total: number;
  hit_points: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
  generation: number;
  legendary: boolean;
  image_url: string;
  captured: boolean;
}

export interface PokemonListResponse {
  total: number;
  page: number;
  page_size: number;
  results: Pokemon[];
}

export type SortOrder = "asc" | "desc";
export type PageSize = 5 | 10 | 20;
