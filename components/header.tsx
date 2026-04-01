"use client";

import { Heart, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeaderTab = "overview" | "explore" | "compare" | "methodology";

type HeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  activeTab: HeaderTab;
  onTabChange: (tab: HeaderTab) => void;
};

const tabs: Array<{ key: HeaderTab; label: string }> = [
  { key: "overview", label: "Map" },
  { key: "explore", label: "Explore" },
  { key: "compare", label: "Compare" },
  { key: "methodology", label: "How it works" }
];

export function Header({ query, onQueryChange, onSubmit, activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 pt-4 md:px-6">
      <div className="glass rounded-[24px] px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-aqua/80">
              <Sparkles className="h-4 w-4" />
              Walkscape
            </div>
            <h1 className="font-display text-3xl leading-none text-white md:text-5xl">
              Find places where everyday life works better on foot.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300 md:text-base">
              Use a simple map to see which places make daily life easier without relying on a car for everything.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:w-[420px]">
            <div className="flex gap-2">
              <label className="glass-strong flex min-w-0 flex-1 items-center gap-3 rounded-xl px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") onSubmit();
                  }}
                  placeholder="Search city, ZIP, or neighborhood"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </label>
              <button
                onClick={onSubmit}
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-aqua"
              >
                Explore
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition",
                  activeTab === tab.key
                    ? "bg-white text-slate-950"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <a
            href="https://www.buymeacoffee.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-rose/30 bg-rose/10 px-4 py-2 text-sm text-rose-100 transition hover:bg-rose/20"
          >
            <Heart className="h-4 w-4" />
            Buy Me a Coffee
          </a>
        </div>
      </div>
    </header>
  );
}
