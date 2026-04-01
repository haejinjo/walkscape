"use client";

import { Heart, Search } from "lucide-react";
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
      <div className="glass rounded-[20px] px-4 py-4 md:px-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="surface-label mb-2">Walkscape</div>
              <h1 className="max-w-3xl font-display text-3xl leading-[0.96] text-white md:text-[4.2rem]">
                U.S. walkability,
                <br />
                read clearly.
              </h1>
            </div>

            <div className="lg:w-[460px]">
              <div className="flex gap-2">
                <label className="glass-strong flex min-w-0 flex-1 items-center gap-3 rounded-[14px] px-4 py-3">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") onSubmit();
                    }}
                    placeholder="Search city, ZIP, or neighborhood"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  />
                </label>
                <button
                  onClick={onSubmit}
                  className="rounded-[14px] bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <nav className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition",
                  activeTab === tab.key
                    ? "metric-chip bg-white text-slate-950"
                    : "text-slate-500 hover:bg-white/[0.04] hover:text-white"
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
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06]"
          >
            <Heart className="h-4 w-4" />
            Support
          </a>
        </div>
      </div>
    </header>
  );
}
