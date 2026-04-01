"use client";

import { Heart, Search, Sparkles } from "lucide-react";

type HeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
};

export function Header({ query, onQueryChange, onSubmit }: HeaderProps) {
  const examples = [
    { label: "Chicago", query: "Chicago" },
    { label: "Santa Monica", query: "Santa Monica" },
    { label: "11217", query: "11217" }
  ];

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 pt-4 md:px-6">
      <div className="glass rounded-[28px] px-4 py-4 shadow-glow md:px-6">
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
              Explore a simpler walkability read built on EPA-derived neighborhood data, with clear categories and map-first comparisons.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:w-[480px]">
            <div className="flex gap-2">
              <label className="glass-strong flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-4 py-3">
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
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-aqua"
              >
                Explore
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {examples.map((example) => (
                  <button
                    key={example.label}
                    onClick={() => onQueryChange(example.query)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:border-aqua/50 hover:text-white"
                  >
                    {example.label}
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            One question. One map. One active lens.
          </div>

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
