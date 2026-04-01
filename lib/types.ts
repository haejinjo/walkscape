export type CategoryKey =
  | "dailyErrands"
  | "carLightLiving"
  | "connectedStreets"
  | "varietyNearby";

export type CategoryScore = {
  key: CategoryKey;
  label: string;
  score: number;
  note: string;
};

export type Neighborhood = {
  id: string;
  city: string;
  state: string;
  label: string;
  blockGroupId: string;
  zip: string;
  overall: number;
  coordinates: {
    x: number;
    y: number;
  };
  categories: CategoryScore[];
  summary: string;
  interpretation: string;
  highlights: string[];
};

export type Place = {
  id: string;
  queryTerms: string[];
  city: string;
  state: string;
  regionLabel: string;
  spotlight: string;
  neighborhoods: Neighborhood[];
};
