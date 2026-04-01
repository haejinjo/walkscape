"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Neighborhood, Place } from "@/lib/types";
import { LocalAreaMap } from "@/components/local-area-map";

type MapStageProps = {
  place: Place;
  selected: Neighborhood;
  compareTarget: Neighborhood | null;
  onSelect: (neighborhood: Neighborhood) => void;
};

export function MapStage({
  place,
  selected,
  compareTarget,
  onSelect
}: MapStageProps) {
  return (
    <section className="glass relative min-h-[520px] overflow-hidden rounded-[24px] p-4 md:p-6">
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 text-xs uppercase tracking-[0.28em] text-aqua/70">Explore</div>
          <h2 className="font-display text-2xl text-white md:text-3xl">{place.city}</h2>
          <p className="max-w-lg text-sm text-slate-300">{place.spotlight}</p>
        </div>
        <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 md:block">
          Neighborhood area view
        </div>
      </div>

      <div className="relative mt-6 h-[420px] overflow-hidden rounded-[20px] border border-white/10 bg-[rgba(4,13,21,0.92)] transition-all duration-500">
        <LocalAreaMap
          place={place}
          selected={selected}
          compareTarget={compareTarget}
          onSelect={onSelect}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-slate-950/65 px-4 py-3 backdrop-blur-md"
          >
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-aqua/80">
              <MapPin className="h-3.5 w-3.5" />
              Selected area
            </div>
            <div className="text-lg font-semibold text-white">{selected.label}</div>
            <div className="text-sm text-slate-300">
              {selected.city}, {selected.state}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
