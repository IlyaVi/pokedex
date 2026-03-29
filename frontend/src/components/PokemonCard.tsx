import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { capturePokemon, releasePokemon } from "@/lib/api";
import type { Pokemon } from "@/types";

const TYPE_COLORS: Record<string, string> = {
  fire: "bg-orange-500",
  water: "bg-blue-500",
  grass: "bg-green-500",
  electric: "bg-yellow-400",
  psychic: "bg-pink-500",
  ice: "bg-cyan-400",
  dragon: "bg-indigo-600",
  dark: "bg-gray-700",
  fairy: "bg-pink-300",
  normal: "bg-gray-400",
  fighting: "bg-red-700",
  flying: "bg-sky-400",
  poison: "bg-purple-500",
  ground: "bg-yellow-700",
  rock: "bg-stone-500",
  bug: "bg-lime-500",
  ghost: "bg-violet-700",
  steel: "bg-slate-400",
};

interface PokemonCardProps {
  pokemon: Pokemon;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const queryClient = useQueryClient();
  const [optimisticCaptured, setOptimisticCaptured] = useState(pokemon.captured);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { mutate } = useMutation({
    mutationKey: ["capture"],
    mutationFn: (captured: boolean) =>
      captured ? releasePokemon(pokemon.number) : capturePokemon(pokemon.number),
    onMutate: (captured) => {
      setOptimisticCaptured(!captured);
    },
    onError: (_err, captured) => {
      setOptimisticCaptured(captured);
      toast.error(`Failed to ${captured ? "release" : "capture"} ${pokemon.name}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pokemon-infinite"] });
    },
  });

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-muted/40 transition-colors">
      {/* Sprite */}
      <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
        {!imgLoaded && !imgError && <Skeleton className="absolute inset-0 rounded-full" />}
        {imgError ? (
          <span className="text-xs text-muted-foreground text-center leading-tight">No image</span>
        ) : (
          <img
            src={pokemon.image_url}
            alt={pokemon.name}
            className="w-12 h-12 object-contain"
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
          />
        )}
      </div>

      {/* Number + Name */}
      <div className="w-32 shrink-0">
        <p className="text-xs text-muted-foreground">#{String(pokemon.number).padStart(3, "0")}</p>
        <p className="font-semibold text-sm leading-tight">{pokemon.name}</p>
        {pokemon.legendary && (
          <span className="text-xs text-yellow-500">★ Legendary</span>
        )}
      </div>

      {/* Types */}
      <div className="flex gap-1 flex-wrap w-36 shrink-0">
        {pokemon.types.map((t) => (
          <Badge
            key={t}
            className={`text-white text-xs capitalize ${TYPE_COLORS[t.toLowerCase()] ?? "bg-gray-400"}`}
          >
            {t}
          </Badge>
        ))}
      </div>

      {/* Stats */}
      <dl className="hidden sm:grid grid-cols-4 gap-x-4 flex-1 text-xs text-muted-foreground">
        <div><dt>HP</dt><dd className="font-medium text-foreground">{pokemon.hit_points}</dd></div>
        <div><dt>ATK</dt><dd className="font-medium text-foreground">{pokemon.attack}</dd></div>
        <div><dt>DEF</dt><dd className="font-medium text-foreground">{pokemon.defense}</dd></div>
        <div><dt>SPD</dt><dd className="font-medium text-foreground">{pokemon.speed}</dd></div>
      </dl>

      {/* Capture button */}
      <Button
        size="sm"
        variant={optimisticCaptured ? "default" : "outline"}
        className="ml-auto shrink-0 w-24"
        onClick={() => mutate(optimisticCaptured)}
        aria-label={optimisticCaptured ? `Release ${pokemon.name}` : `Capture ${pokemon.name}`}
      >
        {optimisticCaptured ? "⚫ Captured" : "○ Capture"}
      </Button>
    </div>
  );
}

export function PokemonCardSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b">
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      <div className="w-32 shrink-0 space-y-1">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex gap-1 w-36 shrink-0">
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="hidden sm:flex flex-1 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-12" />)}
      </div>
      <Skeleton className="h-8 w-24 ml-auto shrink-0" />
    </div>
  );
}
