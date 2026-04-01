import { Neighborhood, Place } from "@/lib/types";

const STATE_CENTERS: Record<string, { lng: number; lat: number }> = {
  AL: { lng: -86.7, lat: 32.7 },
  AK: { lng: -152.4, lat: 64.2 },
  AZ: { lng: -111.7, lat: 34.2 },
  AR: { lng: -92.4, lat: 34.9 },
  CA: { lng: -119.5, lat: 36.5 },
  CO: { lng: -105.5, lat: 39.0 },
  CT: { lng: -72.7, lat: 41.6 },
  DE: { lng: -75.5, lat: 39.0 },
  FL: { lng: -81.5, lat: 27.8 },
  GA: { lng: -83.5, lat: 32.7 },
  HI: { lng: -157.5, lat: 20.9 },
  ID: { lng: -114.1, lat: 44.2 },
  IL: { lng: -89.4, lat: 40.0 },
  IN: { lng: -86.1, lat: 40.0 },
  IA: { lng: -93.5, lat: 42.1 },
  KS: { lng: -98.2, lat: 38.5 },
  KY: { lng: -84.7, lat: 37.5 },
  LA: { lng: -91.8, lat: 31.0 },
  ME: { lng: -69.0, lat: 45.3 },
  MD: { lng: -76.7, lat: 39.0 },
  MA: { lng: -71.8, lat: 42.3 },
  MI: { lng: -84.8, lat: 44.3 },
  MN: { lng: -94.3, lat: 46.3 },
  MS: { lng: -89.7, lat: 32.7 },
  MO: { lng: -92.6, lat: 38.5 },
  MT: { lng: -110.0, lat: 47.0 },
  NE: { lng: -99.8, lat: 41.5 },
  NV: { lng: -116.9, lat: 39.3 },
  NH: { lng: -71.6, lat: 43.7 },
  NJ: { lng: -74.5, lat: 40.1 },
  NM: { lng: -106.1, lat: 34.4 },
  NY: { lng: -75.0, lat: 43.0 },
  NC: { lng: -79.0, lat: 35.5 },
  ND: { lng: -100.5, lat: 47.5 },
  OH: { lng: -82.8, lat: 40.3 },
  OK: { lng: -97.5, lat: 35.6 },
  OR: { lng: -120.6, lat: 43.9 },
  PA: { lng: -77.8, lat: 41.0 },
  RI: { lng: -71.5, lat: 41.7 },
  SC: { lng: -80.9, lat: 33.8 },
  SD: { lng: -100.2, lat: 44.5 },
  TN: { lng: -86.4, lat: 35.8 },
  TX: { lng: -99.3, lat: 31.2 },
  UT: { lng: -111.6, lat: 39.3 },
  VT: { lng: -72.7, lat: 44.1 },
  VA: { lng: -78.8, lat: 37.5 },
  WA: { lng: -120.5, lat: 47.3 },
  WV: { lng: -80.6, lat: 38.6 },
  WI: { lng: -89.6, lat: 44.6 },
  WY: { lng: -107.5, lat: 43.0 },
  DC: { lng: -77.0, lat: 38.9 }
};

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

export function inferStateCode(place: Place) {
  if (place.state && place.state !== "US" && STATE_CENTERS[place.state]) {
    return place.state;
  }

  const match = place.city.match(/,\s*([A-Z]{2})$/);
  if (match && STATE_CENTERS[match[1]]) {
    return match[1];
  }

  return "TX";
}

export function estimatePlaceLngLat(place: Place) {
  const stateCode = inferStateCode(place);
  const center = STATE_CENTERS[stateCode] ?? STATE_CENTERS.TX;
  const seed = hashString(place.city);

  return {
    lng: center.lng + normalizeSeed(seed, 3.6),
    lat: center.lat + normalizeSeed(seed * 13, 2.2)
  };
}

export function estimateNeighborhoodLngLat(place: Place, neighborhood: Neighborhood, index: number) {
  const base = estimatePlaceLngLat(place);
  const seed = hashString(`${place.id}-${neighborhood.id}-${index}`);
  const angle = (seed % 360) * (Math.PI / 180);
  const radius = 0.18 + ((seed % 7) * 0.06);

  return {
    lng: base.lng + Math.cos(angle) * radius,
    lat: base.lat + Math.sin(angle) * radius * 0.8
  };
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function normalizeSeed(seed: number, spread: number) {
  return (((seed % 1000) / 1000) - 0.5) * spread;
}
