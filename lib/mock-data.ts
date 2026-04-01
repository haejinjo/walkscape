import { Place } from "@/lib/types";

const categoryNotes = {
  dailyErrands: [
    "routine needs tend to cluster within a short trip",
    "daily basics are more spread out than the top tier",
    "errands are possible, but not especially compact"
  ],
  carLightLiving: [
    "day-to-day life can stay less car-dependent",
    "you can reduce driving, but not ignore it",
    "most routines still lean on a car"
  ],
  connectedStreets: [
    "routes feel direct instead of circuitous",
    "street connections are decent but not elite",
    "street layout forces more detours than the strongest grids"
  ],
  varietyNearby: [
    "the surrounding mix supports more than one kind of trip",
    "there is some useful variety, but not a dense mix",
    "the area skews single-purpose"
  ]
};

function summarize(overall: number, categories: Place["neighborhoods"][number]["categories"]) {
  const sorted = [...categories].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const lead =
    overall >= 82
      ? "Strong choice for everyday walkability."
      : overall >= 68
        ? "Solid option if you want an easier daily routine."
        : "Usable, but less naturally walkable than top areas nearby.";

  return `${lead} Best on ${best.label.toLowerCase()}, with the main tradeoff in ${weakest.label.toLowerCase()}.`;
}

function interpretation(overall: number) {
  if (overall >= 85) return "Exceptional for settling down car-light";
  if (overall >= 75) return "Very walkable for daily routines";
  if (overall >= 65) return "Balanced, with some car-light upside";
  return "More selective walking convenience";
}

function makeNeighborhood(
  city: string,
  state: string,
  label: string,
  blockGroupId: string,
  zip: string,
  overall: number,
  coordinates: { x: number; y: number },
  scores: [number, number, number, number],
  highlights: string[]
) {
  const categories = [
    {
      key: "dailyErrands" as const,
      label: "Daily Errands",
      score: scores[0],
      note:
        scores[0] >= 78
          ? categoryNotes.dailyErrands[0]
          : scores[0] >= 62
            ? categoryNotes.dailyErrands[1]
            : categoryNotes.dailyErrands[2]
    },
    {
      key: "carLightLiving" as const,
      label: "Car-Light Living",
      score: scores[1],
      note:
        scores[1] >= 78
          ? categoryNotes.carLightLiving[0]
          : scores[1] >= 62
            ? categoryNotes.carLightLiving[1]
            : categoryNotes.carLightLiving[2]
    },
    {
      key: "connectedStreets" as const,
      label: "Connected Streets",
      score: scores[2],
      note:
        scores[2] >= 78
          ? categoryNotes.connectedStreets[0]
          : scores[2] >= 62
            ? categoryNotes.connectedStreets[1]
            : categoryNotes.connectedStreets[2]
    },
    {
      key: "varietyNearby" as const,
      label: "Variety Nearby",
      score: scores[3],
      note:
        scores[3] >= 78
          ? categoryNotes.varietyNearby[0]
          : scores[3] >= 62
            ? categoryNotes.varietyNearby[1]
            : categoryNotes.varietyNearby[2]
    }
  ];

  return {
    id: `${city}-${label}`.toLowerCase().replace(/\s+/g, "-"),
    city,
    state,
    label,
    blockGroupId,
    zip,
    overall,
    coordinates,
    categories,
    summary: summarize(overall, categories),
    interpretation: interpretation(overall),
    highlights
  };
}

export const places: Place[] = [
  {
    id: "los-angeles",
    city: "Los Angeles",
    state: "CA",
    regionLabel: "Westside and central LA sample block groups",
    spotlight: "Compare Santa Monica against Pasadena to see two different versions of walkability.",
    queryTerms: ["los angeles", "la", "pasadena", "santa monica", "90012"],
    neighborhoods: [
      makeNeighborhood(
        "Los Angeles",
        "CA",
        "Santa Monica Core",
        "060372640001",
        "90401",
        91,
        { x: 26, y: 53 },
        [93, 89, 78, 92],
        ["Everyday errands feel compact", "Strong destination density", "Popular benchmark for car-light living"]
      ),
      makeNeighborhood(
        "Los Angeles",
        "CA",
        "Pasadena Civic Edge",
        "060374620022",
        "91101",
        76,
        { x: 68, y: 32 },
        [79, 71, 74, 80],
        ["Balanced daily convenience", "Comfortable comparison pick", "Less concentrated than the coast"]
      ),
      makeNeighborhood(
        "Los Angeles",
        "CA",
        "Silver Lake Junction",
        "060372128031",
        "90026",
        82,
        { x: 53, y: 41 },
        [84, 77, 72, 83],
        ["Useful destination mix", "Good for repeat exploration", "More organic street pattern"]
      ),
      makeNeighborhood(
        "Los Angeles",
        "CA",
        "Culver Steps",
        "060372702001",
        "90232",
        73,
        { x: 38, y: 62 },
        [76, 69, 67, 74],
        ["Solid practical baseline", "Works well in compare mode", "Not as direct as stronger grids"]
      )
    ]
  },
  {
    id: "chicago",
    city: "Chicago",
    state: "IL",
    regionLabel: "North side and near west sample block groups",
    spotlight: "Find underrated walkable areas in Chicago with stronger street connectivity than you might expect.",
    queryTerms: ["chicago", "60614", "logan square", "lincoln park"],
    neighborhoods: [
      makeNeighborhood(
        "Chicago",
        "IL",
        "Lincoln Park Village",
        "170310633001",
        "60614",
        88,
        { x: 62, y: 26 },
        [89, 86, 92, 85],
        ["Elite connected streets", "Daily routines stay compact", "Strong all-around benchmark"]
      ),
      makeNeighborhood(
        "Chicago",
        "IL",
        "Logan Square Spine",
        "170312203002",
        "60647",
        84,
        { x: 38, y: 46 },
        [83, 81, 87, 84],
        ["Very steady category profile", "Appeals to comparison users", "Street grid is a major asset"]
      ),
      makeNeighborhood(
        "Chicago",
        "IL",
        "West Loop Gateway",
        "170318391001",
        "60607",
        86,
        { x: 55, y: 61 },
        [90, 82, 80, 88],
        ["High variety nearby", "Errands are especially easy", "Feels more destination-heavy"]
      ),
      makeNeighborhood(
        "Chicago",
        "IL",
        "Ravenswood Commons",
        "170311402003",
        "60640",
        72,
        { x: 73, y: 16 },
        [71, 68, 81, 69],
        ["Quietly strong street layout", "Moderate car-light upside", "Lower destination mix than top picks"]
      )
    ]
  },
  {
    id: "new-york",
    city: "New York",
    state: "NY",
    regionLabel: "Brooklyn and Queens sample block groups",
    spotlight: "Use compare mode to separate high-variety districts from calmer but still practical options.",
    queryTerms: ["new york", "brooklyn", "queens", "11217", "astoria"],
    neighborhoods: [
      makeNeighborhood(
        "New York",
        "NY",
        "Park Slope Spine",
        "360470165002",
        "11217",
        89,
        { x: 47, y: 57 },
        [90, 87, 83, 91],
        ["Very strong daily rhythm", "High destination mix", "Reliable flagship neighborhood"]
      ),
      makeNeighborhood(
        "New York",
        "NY",
        "Astoria Central",
        "360810143001",
        "11103",
        83,
        { x: 68, y: 28 },
        [85, 80, 76, 84],
        ["Comfortably car-light", "Good comparison against Brooklyn", "Slightly less direct routing"]
      ),
      makeNeighborhood(
        "New York",
        "NY",
        "Fort Greene Frame",
        "360470183001",
        "11205",
        87,
        { x: 56, y: 48 },
        [88, 84, 82, 87],
        ["Even category profile", "Strong for settling down", "Good record mode visuals"]
      ),
      makeNeighborhood(
        "New York",
        "NY",
        "Jackson Heights Grid",
        "360810287002",
        "11372",
        81,
        { x: 76, y: 36 },
        [84, 77, 85, 78],
        ["Excellent street structure", "Practical routines are easy", "Lower mix than denser peers"]
      )
    ]
  }
];

export const defaultPlace = places[0];
