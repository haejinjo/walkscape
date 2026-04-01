"use client";

import { Info } from "lucide-react";

export function MethodologyPanel() {
  return (
    <section className="glass rounded-[24px] p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
        <Info className="h-4 w-4 text-aqua" />
        How it works
      </div>
      <div className="space-y-4 text-sm leading-6 text-slate-300">
        <p>
          Walkscape is built around the <span className="font-semibold text-white">EPA National Walkability Index</span>,
          a relative walkability measure for <span className="font-semibold text-white">U.S. Census 2019 block groups</span>.
          In the main product UI, we describe those as local neighborhood areas. The EPA index draws on variables from the Smart Location Database,
          and Walkscape translates that technical base into four simpler categories.
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="font-medium text-white">Daily Errands</div>
            <div>How realistic it is to handle routine needs nearby.</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="font-medium text-white">Car-Light Living</div>
            <div>How possible it is to structure daily life without defaulting to driving.</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="font-medium text-white">Connected Streets</div>
            <div>Whether the street layout supports direct walking routes.</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="font-medium text-white">Variety Nearby</div>
            <div>Whether useful destinations and activity types are meaningfully mixed together.</div>
          </div>
        </div>
        <p>
          This is a <span className="font-semibold text-white">relative comparison tool</span>, not a complete neighborhood
          score. It does not directly measure sidewalk quality, beauty, safety, affordability, school quality, noise, or personal fit.
          It is meant to help you compare places more quickly, not replace seeing a neighborhood for yourself.
        </p>
      </div>
    </section>
  );
}
