"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Neighborhood, Place } from "@/lib/types";
import { cn } from "@/lib/utils";

type MapStageProps = {
  place: Place;
  selected: Neighborhood;
  compareTarget: Neighborhood | null;
  onSelect: (neighborhood: Neighborhood) => void;
};

function overlayColor(score: number) {
  if (score >= 85) return "rgba(115, 240, 210, 0.92)";
  if (score >= 75) return "rgba(244, 181, 106, 0.9)";
  if (score >= 65) return "rgba(125, 169, 255, 0.88)";
  return "rgba(245, 122, 135, 0.82)";
}

export function MapStage({
  place,
  selected,
  compareTarget,
  onSelect
}: MapStageProps) {
  return (
    <section className="glass relative min-h-[520px] overflow-hidden rounded-[24px] p-4 md:p-6">
      <div className="map-noise absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(115,240,210,0.18),transparent_25%),radial-gradient(circle_at_80%_24%,rgba(125,169,255,0.18),transparent_22%),radial-gradient(circle_at_50%_80%,rgba(245,122,135,0.14),transparent_28%)]" />

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
        <div className="absolute inset-0 bg-grid bg-[size:54px_54px] opacity-[0.09]" />
        <motion.div
          key={place.id}
          initial={{ scale: 1.08, opacity: 0.3 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <defs>
              <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.26)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="transparent" />
            <path d="M6 72 C 22 58, 34 49, 53 45 S 86 56, 95 35" stroke="rgba(115,240,210,0.12)" strokeWidth="0.9" fill="none" />
            <path d="M8 25 C 20 30, 45 24, 61 17 S 91 17, 95 12" stroke="rgba(125,169,255,0.12)" strokeWidth="0.75" fill="none" />
            <path d="M17 8 L 28 26 L 21 44 L 35 58 L 29 79" stroke="rgba(255,255,255,0.08)" strokeWidth="0.7" fill="none" />
            <path d="M68 10 L 56 25 L 63 40 L 54 57 L 61 82" stroke="rgba(255,255,255,0.08)" strokeWidth="0.7" fill="none" />
            {place.neighborhoods.map((item) => {
              const isSelected = item.id === selected.id;
              const isCompare = compareTarget?.id === item.id;

              return (
                <g key={item.id}>
                  <circle
                    cx={item.coordinates.x}
                    cy={item.coordinates.y}
                    r={isSelected ? 12 : isCompare ? 10 : 8}
                    fill="url(#mapGlow)"
                    opacity={isSelected || isCompare ? 0.95 : 0.5}
                  />
                  <motion.circle
                    layout
                    initial={false}
                    animate={{
                      r: isSelected ? 5.8 : isCompare ? 5.1 : 4.1,
                      opacity: isSelected || isCompare ? 1 : 0.9
                    }}
                    cx={item.coordinates.x}
                    cy={item.coordinates.y}
                    fill={overlayColor(item.overall)}
                    stroke={isSelected ? "white" : isCompare ? "rgba(255,255,255,0.76)" : "rgba(255,255,255,0.2)"}
                    strokeWidth={isSelected ? 0.55 : 0.3}
                    className="cursor-pointer"
                    onClick={() => onSelect(item)}
                  />
                  {(isSelected || isCompare) && (
                    <>
                      <text
                        x={item.coordinates.x + 2.4}
                        y={item.coordinates.y - 7}
                        fill="rgba(255,255,255,0.92)"
                        fontSize="3.2"
                        fontWeight="700"
                      >
                        {item.label}
                      </text>
                      <text x={item.coordinates.x + 2.4} y={item.coordinates.y - 3.2} fill="rgba(185,213,231,0.88)" fontSize="2.2">
                        {item.overall} overall
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </motion.div>

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
