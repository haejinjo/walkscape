"use client";

import { Sparkles } from "lucide-react";
import { Place, Neighborhood, CategoryKey } from "@/lib/types";
import { cn, SCORE_BINS } from "@/lib/utils";
import { UsOverviewMap } from "@/components/us-overview-map";

type LensKey = "overall" | CategoryKey;

type EditorialOverviewProps = {
  places: Place[];
  activeLens: LensKey;
  onLensChange: (lens: LensKey) => void;
  featured: Neighborhood | null;
  onSelectNeighborhood: (place: Place, neighborhood: Neighborhood) => void;
};

const lensOptions: Array<{ key: LensKey; label: string }> = [
  { key: "overall", label: "Overall" },
  { key: "dailyErrands", label: "Daily Errands" },
  { key: "carLightLiving", label: "Car-Light Living" },
  { key: "connectedStreets", label: "Connected Streets" },
  { key: "varietyNearby", label: "Variety Nearby" }
];

export function EditorialOverview({
  places,
  activeLens,
  onLensChange,
  featured,
  onSelectNeighborhood
}: EditorialOverviewProps) {
  return (
    <section className="glass relative overflow-hidden rounded-[32px] p-5 shadow-glow md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_60%)]" />

      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-aqua/80">
              <Sparkles className="h-4 w-4" />
              National View
            </div>
            <h2 className="font-display text-3xl leading-tight text-white md:text-5xl">
              Where does everyday life work best on foot?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">
              Pick one lens and read the map.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {lensOptions.map((lens) => (
              <button
                key={lens.key}
                onClick={() => onLensChange(lens.key)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  activeLens === lens.key
                    ? "border-red-400/50 bg-red-500/20 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                )}
              >
                {lens.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#f3efe8] p-4 text-slate-900">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-red-600">United States</div>
              <div className="mt-1 text-2xl font-semibold">
                {activeLens === "overall"
                  ? "Overall walkability"
                  : lensOptions.find((item) => item.key === activeLens)?.label}
              </div>
            </div>
            <div className="rounded-full border border-black/10 bg-black/[0.04] px-3 py-1 text-xs text-black/70">
              Colors match the score ranges in the key below
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[24px] border border-black/10 bg-[#f6f2eb] p-3">
            <UsOverviewMap
              places={places}
              activeLens={activeLens}
              featured={featured}
              onSelectNeighborhood={onSelectNeighborhood}
            />
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-black/60">Legend</div>
              <div className="flex flex-wrap items-center gap-2">
                {SCORE_BINS.map((stop) => (
                  <div key={stop.label} className="flex items-center gap-2">
                    <div className={cn("h-3 w-10 rounded-sm", stop.className)} />
                    <span className="text-xs text-black/70">{stop.label}</span>
                  </div>
                ))}
              </div>
              <p className="max-w-xl text-sm leading-6 text-black/65">
                Each dot is one local area.
              </p>
            </div>

            {featured ? (
              <button
                onClick={() => {
                  const place = places.find((item) => item.city === featured.city && item.state === featured.state);
                  if (place) onSelectNeighborhood(place, featured);
                }}
                className="rounded-full border border-black/10 bg-black/[0.04] px-4 py-2 text-sm text-black/70 transition hover:bg-black/[0.08]"
              >
                Top area right now: {featured.city} · {featured.label}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
