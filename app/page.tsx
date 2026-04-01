"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ComparePanel } from "@/components/compare-panel";
import { EditorialOverview } from "@/components/editorial-overview";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MapStage } from "@/components/map-stage";
import { MethodologyPanel } from "@/components/methodology-panel";
import { ProfileCard } from "@/components/profile-card";
import type { PlacesApiResponse } from "@/lib/api-types";
import { defaultPlace } from "@/lib/mock-data";
import { CategoryKey, Neighborhood, Place } from "@/lib/types";

function pickDefaultSelection(place: Place) {
  return place.neighborhoods[0];
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([defaultPlace]);
  const [source, setSource] = useState<PlacesApiResponse["source"]>("mock");
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [activePlace, setActivePlace] = useState<Place>(defaultPlace);
  const [selected, setSelected] = useState<Neighborhood>(pickDefaultSelection(defaultPlace));
  const [compareTarget, setCompareTarget] = useState<Neighborhood | null>(defaultPlace.neighborhoods[1]);
  const [recordMode, setRecordMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLens, setActiveLens] = useState<"overall" | CategoryKey>("overall");
  const [autoplay, setAutoplay] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  useEffect(() => {
    void loadPlaces(query);
  }, []);

  const flattenedNeighborhoods = useMemo(
    () => places.flatMap((place) => place.neighborhoods.map((neighborhood) => ({ place, neighborhood }))),
    [places]
  );

  const featuredEntry = useMemo(() => {
    if (!flattenedNeighborhoods.length) return null;

    const sorted = [...flattenedNeighborhoods].sort((a, b) => {
      const scoreA =
        activeLens === "overall"
          ? a.neighborhood.overall
          : a.neighborhood.categories.find((item) => item.key === activeLens)?.score ?? a.neighborhood.overall;
      const scoreB =
        activeLens === "overall"
          ? b.neighborhood.overall
          : b.neighborhood.categories.find((item) => item.key === activeLens)?.score ?? b.neighborhood.overall;
      return scoreB - scoreA;
    });

    return sorted[storyIndex % sorted.length] ?? null;
  }, [activeLens, flattenedNeighborhoods, storyIndex]);

  useEffect(() => {
    if (!autoplay || !flattenedNeighborhoods.length) return;

    const lenses: Array<"overall" | CategoryKey> = [
      "overall",
      "dailyErrands",
      "carLightLiving",
      "connectedStreets",
      "varietyNearby"
    ];

    const interval = window.setInterval(() => {
      setStoryIndex((value) => value + 1);
      setActiveLens((current) => lenses[(lenses.indexOf(current) + 1) % lenses.length]);
    }, 2400);

    return () => window.clearInterval(interval);
  }, [autoplay, flattenedNeighborhoods.length]);

  useEffect(() => {
    if (!featuredEntry) return;
    setActivePlace(featuredEntry.place);
    setSelected(featuredEntry.neighborhood);
  }, [featuredEntry]);

  async function loadPlaces(nextQuery: string) {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/places?q=${encodeURIComponent(nextQuery)}`, {
        cache: "no-store"
      });
      const data = (await response.json()) as PlacesApiResponse;

      startTransition(() => {
        const nextPlaces = data.places.length ? data.places : [defaultPlace];
        const nextActivePlace = nextPlaces[0];

        setPlaces(nextPlaces);
        setSource(data.source);
        setGeneratedAt(data.generatedAt);
        setActivePlace(nextActivePlace);
        setSelected(pickDefaultSelection(nextActivePlace));
        setCompareTarget(nextActivePlace.neighborhoods[1] ?? null);
        setStoryIndex(0);
      });
    } catch {
      startTransition(() => {
        setPlaces([defaultPlace]);
        setSource("mock");
        setGeneratedAt(null);
        setActivePlace(defaultPlace);
        setSelected(pickDefaultSelection(defaultPlace));
        setCompareTarget(defaultPlace.neighborhoods[1] ?? null);
        setStoryIndex(0);
      });
    } finally {
      setIsLoading(false);
    }
  }

  function runSearch() {
    void loadPlaces(query);
  }

  function toggleCompareTarget() {
    if (compareTarget?.id === selected.id) {
      setCompareTarget(activePlace.neighborhoods.find((item) => item.id !== selected.id) ?? null);
      return;
    }
    setCompareTarget(selected);
  }

  function selectNeighborhood(next: Neighborhood) {
    setSelected(next);
  }

  function openNeighborhood(place: Place, neighborhood: Neighborhood) {
    setActivePlace(place);
    setSelected(neighborhood);
    setQuery(place.city);
  }

  function swapCompare() {
    if (!compareTarget) return;
    setSelected(compareTarget);
    setCompareTarget(selected);
  }

  return (
    <main className="relative overflow-hidden">
      <Header
        query={query}
        onQueryChange={setQuery}
        onSubmit={runSearch}
        recordMode={recordMode}
        onRecordModeToggle={() => setRecordMode((value) => !value)}
      />

      <div className="mx-auto w-full max-w-[1500px] px-4 py-4 md:px-6">
        <EditorialOverview
          places={places}
          activeLens={activeLens}
          onLensChange={(lens) => {
            setActiveLens(lens);
            setAutoplay(false);
          }}
          autoplay={autoplay}
          onToggleAutoplay={() => setAutoplay((value) => !value)}
          featured={featuredEntry?.neighborhood ?? null}
          onSelectNeighborhood={openNeighborhood}
        />
      </div>

      <div className="mx-auto grid w-full max-w-[1500px] gap-4 px-4 py-4 md:px-6 lg:grid-cols-[1.35fr_0.9fr]">
        <MapStage
          place={activePlace}
          selected={selected}
          compareTarget={compareTarget}
          onSelect={selectNeighborhood}
          recordMode={recordMode}
        />

        <ProfileCard
          title={recordMode ? "Record-ready profile" : "Neighborhood profile"}
          neighborhood={selected}
          onCompare={toggleCompareTarget}
          compareLabel={
            compareTarget?.id === selected.id ? "Pinned for compare" : compareTarget ? "Replace compare pick" : "Add to compare"
          }
        />
      </div>

      <div className="mx-auto grid w-full max-w-[1500px] gap-4 px-4 pb-4 md:px-6">
        <section className="glass rounded-[30px] p-5 shadow-glow">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.28em] text-aqua/70">Search Results</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
              Data source: {source === "processed" ? "Processed EPA file" : "Mock fallback"}
              {generatedAt ? ` · ${new Date(generatedAt).toLocaleDateString()}` : ""}
              {isLoading ? " · loading" : ""}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {places.map((place) => (
              <button
                key={place.id}
                onClick={() => {
                  setQuery(place.city);
                  setActivePlace(place);
                  setSelected(pickDefaultSelection(place));
                  setCompareTarget(place.neighborhoods[1] ?? null);
                }}
                className={`rounded-[24px] border p-4 text-left transition ${
                  activePlace.id === place.id
                    ? "border-aqua/40 bg-aqua/10"
                    : "border-white/10 bg-white/[0.04] hover:border-white/20"
                }`}
              >
                <div className="font-display text-2xl text-white">
                  {place.city}, {place.state}
                </div>
                <p className="mt-2 text-sm text-slate-300">{place.regionLabel}</p>
              </button>
            ))}
          </div>
        </section>

        <AnimatePresence>
          {compareTarget && compareTarget.id !== selected.id ? (
            <div className="grid gap-4 lg:grid-cols-[1.1fr_1.1fr_1.2fr]">
              <ProfileCard
                title="Primary"
                neighborhood={selected}
                onCompare={toggleCompareTarget}
                compareLabel="Update compare pair"
                compact
              />
              <ProfileCard
                title="Comparison"
                neighborhood={compareTarget}
                onCompare={() => setCompareTarget(null)}
                compareLabel="Remove from compare"
                compact
              />
              <ComparePanel primary={selected} secondary={compareTarget} onSwap={swapCompare} onClear={() => setCompareTarget(null)} />
            </div>
          ) : null}
        </AnimatePresence>

        <MethodologyPanel />
      </div>

      <Footer />
    </main>
  );
}
