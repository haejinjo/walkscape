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
import type { HeaderTab } from "@/components/header";

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
  const [isLoading, setIsLoading] = useState(false);
  const [activeLens, setActiveLens] = useState<"overall" | CategoryKey>("overall");
  const [activeTab, setActiveTab] = useState<HeaderTab>("overview");

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

    return sorted[0] ?? null;
  }, [activeLens, flattenedNeighborhoods]);

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
      });
    } catch {
      startTransition(() => {
        setPlaces([defaultPlace]);
        setSource("mock");
        setGeneratedAt(null);
        setActivePlace(defaultPlace);
        setSelected(pickDefaultSelection(defaultPlace));
        setCompareTarget(defaultPlace.neighborhoods[1] ?? null);
      });
    } finally {
      setIsLoading(false);
    }
  }

  function runSearch() {
    setActiveTab("explore");
    void loadPlaces(query);
  }

  function toggleCompareTarget() {
    if (compareTarget?.id === selected.id) {
      setCompareTarget(activePlace.neighborhoods.find((item) => item.id !== selected.id) ?? null);
      setActiveTab("compare");
      return;
    }
    setCompareTarget(selected);
    setActiveTab("compare");
  }

  function selectNeighborhood(next: Neighborhood) {
    setSelected(next);
  }

  function openNeighborhood(place: Place, neighborhood: Neighborhood) {
    setActivePlace(place);
    setSelected(neighborhood);
    setQuery(place.city);
    setActiveTab("explore");
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
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "overview" ? (
        <div className="mx-auto w-full max-w-[1500px] px-4 py-4 md:px-6">
          <EditorialOverview
            places={places}
            activeLens={activeLens}
            onLensChange={setActiveLens}
            featured={featuredEntry?.neighborhood ?? null}
            onSelectNeighborhood={openNeighborhood}
          />
        </div>
      ) : null}

      {activeTab === "explore" ? (
        <div className="mx-auto grid w-full max-w-[1500px] gap-4 px-4 py-4 md:px-6 lg:grid-cols-[1.35fr_0.9fr]">
          <MapStage
            place={activePlace}
            selected={selected}
            compareTarget={compareTarget}
            onSelect={selectNeighborhood}
          />

          <ProfileCard
            title="Neighborhood area"
            neighborhood={selected}
            onCompare={toggleCompareTarget}
            compareLabel={
              compareTarget?.id === selected.id ? "Pinned for compare" : compareTarget ? "Replace compare pick" : "Compare this area"
            }
          />
        </div>
      ) : null}

      {activeTab === "compare" ? (
        <div className="mx-auto grid w-full max-w-[1500px] gap-4 px-4 py-4 md:px-6">
          <section className="glass rounded-[24px] p-5">
            <div className="mb-2 text-xs uppercase tracking-[0.28em] text-aqua/70">Compare</div>
            <h2 className="font-display text-2xl text-white md:text-3xl">Compare two neighborhood areas</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Select one area in Explore, click compare, then choose the second area. This view keeps the comparison separate from the main map.
            </p>
          </section>

          <AnimatePresence>
            {compareTarget && compareTarget.id !== selected.id ? (
              <div className="grid gap-4 lg:grid-cols-[1.1fr_1.1fr_1.2fr]">
                <ProfileCard
                  title="Primary area"
                  neighborhood={selected}
                  onCompare={toggleCompareTarget}
                  compareLabel="Update compare pair"
                  compact
                />
                <ProfileCard
                  title="Comparison area"
                  neighborhood={compareTarget}
                  onCompare={() => setCompareTarget(null)}
                  compareLabel="Remove from compare"
                  compact
                />
                <ComparePanel
                  primary={selected}
                  secondary={compareTarget}
                  onSwap={swapCompare}
                  onClear={() => setCompareTarget(null)}
                />
              </div>
            ) : (
              <section className="glass rounded-[24px] p-5 text-sm text-slate-300">
                No comparison is active yet. Go to `Explore`, pick an area, and use `Compare this area`.
              </section>
            )}
          </AnimatePresence>
        </div>
      ) : null}

      {activeTab === "methodology" ? (
        <div className="mx-auto grid w-full max-w-[1500px] gap-4 px-4 py-4 md:px-6">
          <section className="glass rounded-[24px] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
              <span className="uppercase tracking-[0.28em] text-aqua/70">Data</span>
              <span>
                {source === "processed" ? "Processed EPA file" : "Mock fallback"}
                {generatedAt ? ` · ${new Date(generatedAt).toLocaleDateString()}` : ""}
                {isLoading ? " · loading" : ""}
              </span>
            </div>
          </section>
          <MethodologyPanel />
        </div>
      ) : null}

      <Footer />
    </main>
  );
}
