import type { Place } from "@/lib/types";

export type DataSourceKind = "mock" | "processed";

export type PlacesApiResponse = {
  source: DataSourceKind;
  generatedAt: string | null;
  places: Place[];
};
