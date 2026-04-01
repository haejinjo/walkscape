"use client";

import { motion } from "framer-motion";
import { BarChart3, Plus } from "lucide-react";
import { Neighborhood } from "@/lib/types";
import { cn, scoreColor } from "@/lib/utils";

type ProfileCardProps = {
  title: string;
  neighborhood: Neighborhood;
  onCompare: () => void;
  compareLabel: string;
  compact?: boolean;
};

export function ProfileCard({
  title,
  neighborhood,
  onCompare,
  compareLabel,
  compact
}: ProfileCardProps) {
  return (
    <motion.section
      layout
      className={cn(
        "glass h-full rounded-[24px] p-5",
        compact ? "min-h-[380px]" : "min-h-[460px]"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 text-xs uppercase tracking-[0.28em] text-aqua/70">{title}</div>
          <h3 className="font-display text-3xl text-white">{neighborhood.label}</h3>
          <p className="mt-1 text-sm text-slate-300">
            {neighborhood.city}, {neighborhood.state} · ZIP {neighborhood.zip}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
          <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Overall</div>
          <div className="text-3xl font-semibold text-white">{neighborhood.overall}</div>
        </div>
      </div>

      <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
        <div className="text-sm font-medium text-white">{neighborhood.interpretation}</div>
        <p className="mt-2 text-sm leading-6 text-slate-300">{neighborhood.summary}</p>
      </div>

      <div className="mt-5 grid gap-3">
        {neighborhood.categories.map((category) => (
          <div key={category.key} className="rounded-[18px] border border-white/8 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-white">{category.label}</div>
                <div className="text-xs text-slate-400">{category.note}</div>
              </div>
              <div className="text-xl font-semibold text-white">{category.score}</div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className={cn("h-full rounded-full bg-gradient-to-r", scoreColor(category.score))}
                style={{ width: `${category.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
          <BarChart3 className="h-4 w-4 text-aqua" />
          Quick reads
        </div>
        <div className="flex flex-wrap gap-2">
          {neighborhood.highlights.map((item) => (
            <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={onCompare}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-aqua"
        >
          <Plus className="h-4 w-4" />
          {compareLabel}
        </button>
      </div>
    </motion.section>
  );
}
