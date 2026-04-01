"use client";

import { motion } from "framer-motion";
import { ArrowRightLeft, Trophy } from "lucide-react";
import { Neighborhood } from "@/lib/types";
import { compareSummary } from "@/lib/utils";

type ComparePanelProps = {
  primary: Neighborhood;
  secondary: Neighborhood;
  onSwap: () => void;
  onClear: () => void;
};

export function ComparePanel({ primary, secondary, onSwap, onClear }: ComparePanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-[24px] p-5"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 text-xs uppercase tracking-[0.28em] text-aqua/70">Compare</div>
          <h3 className="font-display text-2xl text-white md:text-3xl">What feels different</h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">{compareSummary(primary, secondary)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSwap}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Swap
          </button>
          <button
            onClick={onClear}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
          >
            Clear compare
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {primary.categories.map((category, index) => {
          const other = secondary.categories[index];
          const leader = category.score >= other.score ? primary.label : secondary.label;

          return (
            <div key={category.key} className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-white">{category.label}</div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                  <Trophy className="h-3.5 w-3.5 text-sun" />
                  {leader}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div>
                  <div className="mb-1 flex justify-between text-sm text-slate-300">
                    <span>{primary.label}</span>
                    <span>{category.score}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-gradient-to-r from-aqua to-emerald-300" style={{ width: `${category.score}%` }} />
                  </div>
                </div>
                <div className="text-center text-xs uppercase tracking-[0.24em] text-slate-500">vs</div>
                <div>
                  <div className="mb-1 flex justify-between text-sm text-slate-300">
                    <span>{secondary.label}</span>
                    <span>{other.score}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-gradient-to-r from-sun to-amber-300" style={{ width: `${other.score}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
