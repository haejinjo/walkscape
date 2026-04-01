import { Neighborhood, Place } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function searchPlaces(query: string, places: Place[]) {
  const value = query.trim().toLowerCase();
  if (!value) return places;

  return places.filter((place) =>
    [place.city, place.state, place.regionLabel, ...place.queryTerms].some((term) =>
      term.toLowerCase().includes(value)
    )
  );
}

export function scoreColor(score: number) {
  if (score >= 85) return "from-aqua to-emerald-300";
  if (score >= 75) return "from-sun to-amber-300";
  if (score >= 65) return "from-violet-400 to-sky-300";
  return "from-rose to-orange-300";
}

export function compareSummary(primary: Neighborhood, secondary: Neighborhood) {
  const p = primary.categories.reduce((acc, item) => acc + item.score, 0);
  const s = secondary.categories.reduce((acc, item) => acc + item.score, 0);
  const leader = p >= s ? primary : secondary;
  const trailer = leader.id === primary.id ? secondary : primary;
  const strongestGap = leader.categories
    .map((item, index) => ({
      label: item.label,
      gap: item.score - trailer.categories[index].score
    }))
    .sort((a, b) => b.gap - a.gap)[0];

  return `${leader.label} leads overall, with the clearest edge in ${strongestGap.label.toLowerCase()}.`;
}

export function pseudoToLngLat(coordinates: { x: number; y: number }) {
  const lng = (((coordinates.x - 10) / 80) * 360) - 180;
  const lat = (((90 - coordinates.y) / 80) * 180) - 90;

  return {
    lng,
    lat
  };
}
