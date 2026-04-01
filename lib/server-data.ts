import { promises as fs } from "node:fs";
import path from "node:path";
import { defaultPlace, places as mockPlaces } from "@/lib/mock-data";
import type { PlacesApiResponse } from "@/lib/api-types";
import type { Place } from "@/lib/types";

const processedPath = path.join(process.cwd(), "data/processed/place-index.json");

type ProcessedFile = {
  generatedAt?: string;
  places?: Place[];
};

export async function getPlacesData(query?: string): Promise<PlacesApiResponse> {
  const processed = await readProcessedPlaces();
  const basePlaces = processed?.places?.length ? processed.places : mockPlaces;
  const source = processed?.places?.length ? "processed" : "mock";
  const generatedAt = processed?.generatedAt ?? null;
  const normalizedQuery = query?.trim().toLowerCase() ?? "";

  const filtered = normalizedQuery
    ? basePlaces.filter((place) =>
        [place.city, place.state, place.regionLabel, place.spotlight, ...place.queryTerms].some((term) =>
          term.toLowerCase().includes(normalizedQuery)
        )
      )
    : basePlaces;

  return {
    source,
    generatedAt,
    places: sanitizePlaces(filtered.length ? filtered : [defaultPlace])
  };
}

async function readProcessedPlaces(): Promise<ProcessedFile | null> {
  try {
    const raw = await fs.readFile(processedPath, "utf8");
    return JSON.parse(raw) as ProcessedFile;
  } catch {
    return null;
  }
}

function sanitizePlaces(places: Place[]) {
  return places.map((place) => ({
    ...place,
    regionLabel: place.regionLabel.replace(/block groups?/gi, "local areas"),
    neighborhoods: place.neighborhoods.map((neighborhood, index) => ({
      ...neighborhood,
      label: sanitizeNeighborhoodLabel(neighborhood.label, neighborhood.blockGroupId, index),
      highlights: neighborhood.highlights.filter((item) => !/block group/i.test(item))
    }))
  }));
}

function sanitizeNeighborhoodLabel(label: string, blockGroupId: string, index: number) {
  if (/block group/i.test(label)) {
    const suffix = blockGroupId ? blockGroupId.slice(-4) : String(index + 1).padStart(2, "0");
    return `Local area ${suffix}`;
  }

  return label;
}
