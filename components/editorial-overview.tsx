"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Place, Neighborhood, CategoryKey } from "@/lib/types";
import { cn } from "@/lib/utils";

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

const legendStops = [
  { label: "Lower", color: "bg-slate-500" },
  { label: "Moderate", color: "bg-slate-300" },
  { label: "Strong", color: "bg-rose-200" },
  { label: "Very strong", color: "bg-rose-500" },
  { label: "Top tier", color: "bg-red-700" }
];

function lensScore(neighborhood: Neighborhood, lens: LensKey) {
  if (lens === "overall") return neighborhood.overall;
  return neighborhood.categories.find((item) => item.key === lens)?.score ?? neighborhood.overall;
}

function placeCoordinate(index: number, total: number) {
  const columns = 8;
  const row = Math.floor(index / columns);
  const column = index % columns;
  const x = 12 + column * 10.8 + (row % 2) * 2.4;
  const y = 20 + row * 12.5;

  return {
    x: Math.min(x, 88),
    y: Math.min(y, total > columns ? y : 50)
  };
}

function colorForScore(score: number) {
  if (score >= 86) return "#b91c1c";
  if (score >= 76) return "#ef4444";
  if (score >= 66) return "#fca5a5";
  if (score >= 56) return "#d4d4d8";
  return "#737373";
}

function radiusForScore(score: number) {
  if (score >= 86) return 4.8;
  if (score >= 76) return 4.2;
  if (score >= 66) return 3.8;
  if (score >= 56) return 3.4;
  return 3;
}

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
              Pick one lens, read the map, and click a place that stands out. The goal is to make the first read obvious in a few seconds.
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
              Darker red means stronger support for walking
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[24px] border border-black/10 bg-[#f6f2eb] p-3">
            <svg viewBox="0 0 100 62" className="h-[360px] w-full">
              <path
                d="M9 21 L17 17 L24 18 L31 15 L37 17 L46 16 L55 18 L63 16 L71 19 L79 18 L86 22 L91 30 L88 36 L79 39 L72 45 L60 46 L49 44 L39 47 L28 45 L18 40 L11 34 L8 28 Z"
                fill="#d6d1c8"
                stroke="#5f5a53"
                strokeWidth="0.45"
              />
              <path d="M13 46 L19 49 L18 55 L12 54 Z" fill="#d6d1c8" stroke="#5f5a53" strokeWidth="0.45" />
              <path d="M27 51 L30 55 L26 58 L23 53 Z" fill="#d6d1c8" stroke="#5f5a53" strokeWidth="0.45" />

              {places.map((place, index) => {
                const topNeighborhood = [...place.neighborhoods].sort(
                  (a, b) => lensScore(b, activeLens) - lensScore(a, activeLens)
                )[0];
                if (!topNeighborhood) return null;

                const point = placeCoordinate(index, places.length);
                const score = lensScore(topNeighborhood, activeLens);
                const isFeatured = featured?.id === topNeighborhood.id;

                return (
                  <g key={place.id}>
                    <motion.circle
                      initial={false}
                      animate={{
                        r: isFeatured ? radiusForScore(score) + 1.8 : radiusForScore(score),
                        opacity: isFeatured ? 1 : 0.9
                      }}
                      cx={point.x}
                      cy={point.y}
                      fill={colorForScore(score)}
                      stroke={isFeatured ? "#111827" : "rgba(17,24,39,0.25)"}
                      strokeWidth={isFeatured ? 0.8 : 0.35}
                      className="cursor-pointer"
                      onClick={() => onSelectNeighborhood(place, topNeighborhood)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-black/60">Legend</div>
              <div className="flex flex-wrap items-center gap-2">
                {legendStops.map((stop) => (
                  <div key={stop.label} className="flex items-center gap-2">
                    <div className={cn("h-3 w-10 rounded-sm", stop.color)} />
                    <span className="text-xs text-black/70">{stop.label}</span>
                  </div>
                ))}
              </div>
              <p className="max-w-xl text-sm leading-6 text-black/65">
                Each dot is one local area in the current sample. Click any dot to open that area in the detailed map view.
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
