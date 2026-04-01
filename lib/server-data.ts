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
    places: filtered.length ? filtered : [defaultPlace]
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
