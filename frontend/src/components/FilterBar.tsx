import { useQuery } from "@tanstack/react-query";
import { fetchTypes } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { SortOrder, PageSize } from "@/types";

interface FilterBarProps {
  order: SortOrder;
  onOrderChange: (value: SortOrder) => void;
  type: string | null;
  onTypeChange: (value: string | null) => void;
  search: string;
  onSearchChange: (value: string) => void;
  pageSize: PageSize;
  onPageSizeChange: (value: PageSize) => void;
}

const ALL_TYPES_VALUE = "__all__";

export function FilterBar({
  order,
  onOrderChange,
  type,
  onTypeChange,
  search,
  onSearchChange,
  pageSize,
  onPageSizeChange,
}: FilterBarProps) {
  const { data: types = [] } = useQuery({
    queryKey: ["types"],
    queryFn: fetchTypes,
    staleTime: Infinity,
  });

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <Input
        placeholder="Search Pokémon…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-48"
        aria-label="Search Pokémon"
      />

      {/* Type filter */}
      <Select
        value={type ?? ALL_TYPES_VALUE}
        onValueChange={(v) => onTypeChange(v === ALL_TYPES_VALUE ? null : v)}
      >
        <SelectTrigger className="w-36" aria-label="Filter by type">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_TYPES_VALUE}>All types</SelectItem>
          {types.map((t) => (
            <SelectItem key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort order */}
      <Select value={order} onValueChange={(v) => onOrderChange(v as SortOrder)}>
        <SelectTrigger className="w-36" aria-label="Sort order">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">№ Ascending</SelectItem>
          <SelectItem value="desc">№ Descending</SelectItem>
        </SelectContent>
      </Select>

      {/* Page size */}
      <Select
        value={String(pageSize)}
        onValueChange={(v) => onPageSizeChange(Number(v) as PageSize)}
      >
        <SelectTrigger className="w-28" aria-label="Page size">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {([5, 10, 20] as PageSize[]).map((s) => (
            <SelectItem key={s} value={String(s)}>
              {s} / page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
