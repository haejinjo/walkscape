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
    <section className="glass relative overflow-hidden rounded-[22px] p-5 md:p-6">
      <div className="relative z-10 grid gap-5 lg:grid-cols-[0.36fr_1fr]">
        <div className="space-y-5">
          <div>
            <div className="surface-label mb-2 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              National view
            </div>
            <h2 className="font-display text-3xl leading-[1] text-white md:text-[3.35rem]">
              Where walking works best.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Switch the lens. Read the map. Open a place.
            </p>
          </div>

          <div className="space-y-2">
            {lensOptions.map((lens) => (
              <button
                key={lens.key}
                onClick={() => onLensChange(lens.key)}
                className={cn(
                  "flex w-full items-center justify-between rounded-[14px] border px-4 py-3 text-left text-sm transition",
                  activeLens === lens.key
                    ? "border-white/20 bg-white/[0.08] text-white"
                    : "border-white/8 bg-white/[0.02] text-slate-400 hover:border-white/16 hover:text-white"
                )}
              >
                <span>{lens.label}</span>
                <span className="text-xs text-slate-500">View</span>
              </button>
            ))}
          </div>

          <div className="grid gap-3 rounded-[18px] border border-white/8 bg-white/[0.02] p-4">
            <div className="surface-label">Current lens</div>
            <div className="text-lg font-medium text-white">
              {activeLens === "overall"
                ? "Overall walkability"
                : lensOptions.find((item) => item.key === activeLens)?.label}
            </div>
            {featured ? (
              <div className="border-t border-white/8 pt-3">
                <div className="surface-label mb-1">Top place</div>
                <div className="text-sm text-white">{featured.city}</div>
                <div className="text-sm text-slate-500">{featured.label}</div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[20px] border border-white/8 bg-[#f6f2eb] p-4 text-slate-900">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="surface-label !text-[rgba(153,27,27,0.75)]">United States</div>
              <div className="mt-1 text-[1.75rem] font-semibold tracking-[-0.03em]">
                {activeLens === "overall"
                  ? "Overall walkability"
                  : lensOptions.find((item) => item.key === activeLens)?.label}
              </div>
            </div>
            <div className="rounded-full border border-black/10 bg-black/[0.04] px-3 py-1 text-xs text-black/65">
              EPA-based relative ranking
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-black/10 bg-white">
            <UsOverviewMap
              places={places}
              activeLens={activeLens}
              featured={featured}
              onSelectNeighborhood={onSelectNeighborhood}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="surface-label !text-[rgba(15,23,42,0.55)]">Score bands</div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {SCORE_BINS.map((stop) => (
                  <div key={stop.label} className="flex items-center gap-2">
                    <div className={cn("h-2.5 w-11 rounded-sm", stop.className)} />
                    <span className="text-xs text-black/70">{stop.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {featured ? (
              <button
                onClick={() => {
                  const place = places.find((item) => item.city === featured.city && item.state === featured.state);
                  if (place) onSelectNeighborhood(place, featured);
                }}
                className="rounded-full border border-black/10 bg-black/[0.04] px-4 py-2 text-sm text-black/70 transition hover:bg-black/[0.08]"
              >
                Open {featured.city}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
