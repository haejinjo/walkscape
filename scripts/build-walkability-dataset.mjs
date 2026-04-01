import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const inputPath = process.argv[2] || path.join(process.cwd(), "data/raw/EPA_SmartLocationDatabase_V3_Jan_2021_Final.csv");
const outputPath = process.argv[3] || path.join(process.cwd(), "data/processed/place-index.json");
const rowLimitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const rowLimit = rowLimitArg ? Number(rowLimitArg.split("=")[1]) : Number.POSITIVE_INFINITY;

const FIELD_ALIASES = {
  geoid: ["GEOID20", "GEOID", "GEOID10", "BLKGRP", "BG_ID"],
  state: ["STATE_NAME", "STATE", "STATE_ABBR", "STUSPS", "STATEFP"],
  city: ["CITY", "PLACE_NAME", "NAMELSAD", "CBSA_Name", "CBSA_NAME", "CBSA"],
  zip: ["ZIP", "ZIPCODE", "ZCTA5CE10"],
  overall: ["NatWalkInd"],
  d2a: ["D2A_Ranked", "D2A_RANKED"],
  d2b: ["D2B_Ranked", "D2B_RANKED"],
  d3b: ["D3B_Ranked", "D3b_Ranked", "D3B", "D3b"],
  d4a: ["D4A_Ranked", "D4a_Ranked", "D4A", "D4a"],
  x: ["POINT_X", "X", "INTPTLON", "LON", "LONGITUDE"],
  y: ["POINT_Y", "Y", "INTPTLAT", "LAT", "LATITUDE"]
};

const STATEFP_TO_ABBR = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT", "10": "DE",
  "11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN", "19": "IA",
  "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
  "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH", "34": "NJ", "35": "NM",
  "36": "NY", "37": "NC", "38": "ND", "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
  "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
  "54": "WV", "55": "WI", "56": "WY", "72": "PR"
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input CSV not found at ${inputPath}`);
  }

  const input = fs.createReadStream(inputPath);
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  const grouped = new Map();
  const seenNeighborhoods = new Set();

  let rowCount = 0;
  let headerMap = null;

  for await (const line of rl) {
    if (!line.trim()) continue;

    if (!headerMap) {
      headerMap = buildHeaderMap(parseCsvLine(line));
      continue;
    }

    const values = parseCsvLine(line);
    const row = readRow(values, headerMap);
    if (!row) continue;
    if (seenNeighborhoods.has(row.geoid)) continue;
    seenNeighborhoods.add(row.geoid);

    const cityKey = `${row.city}|${row.state}`;
    if (!grouped.has(cityKey)) {
      grouped.set(cityKey, {
        id: slugify(cityKey),
        city: row.city,
        state: row.state,
        regionLabel: `${row.city}, ${row.state} EPA walkability sample`,
        spotlight: `Imported from the EPA Smart Location Database / National Walkability Index fields for ${row.city}.`,
        queryTerms: [row.city, row.state, row.zip].filter(Boolean),
        neighborhoods: []
      });
    }

    const place = grouped.get(cityKey);
    place.neighborhoods.push(makeNeighborhood(row, place.neighborhoods.length));
    rowCount += 1;

    if (rowCount >= rowLimit) break;
  }

  const places = [...grouped.values()]
    .map((place) => ({
      ...place,
      neighborhoods: place.neighborhoods
        .sort((a, b) => b.overall - a.overall)
        .slice(0, 8)
    }))
    .filter((place) => place.neighborhoods.length > 0)
    .sort((a, b) => a.city.localeCompare(b.city));

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        sourceFile: path.basename(inputPath),
        rowCount,
        places
      },
      null,
      2
    )
  );

  console.log(`Wrote ${places.length} places from ${rowCount} rows to ${outputPath}`);
}

function buildHeaderMap(headers) {
  const resolved = {};

  for (const [key, aliases] of Object.entries(FIELD_ALIASES)) {
    const match = aliases.find((alias) => headers.includes(alias));
    if (match) resolved[key] = headers.indexOf(match);
  }

  if (resolved.overall === undefined) {
    throw new Error("Could not find NatWalkInd in the CSV header");
  }

  return resolved;
}

function readRow(values, headerMap) {
  const overall = toNationalScore(values[headerMap.overall]);
  if (overall === null) return null;

  const geoid = normalizeGeoid(readValue(values, headerMap.geoid)) || `unknown-${Math.random().toString(36).slice(2, 10)}`;
  const cityValue = readValue(values, headerMap.city);
  const stateValue = readValue(values, headerMap.state);
  const state = normalizeState(stateValue, cityValue);
  const city = normalizeCity(cityValue, state);
  const zip = readValue(values, headerMap.zip) || "";

  const d2a = toNationalScore(readValue(values, headerMap.d2a)) ?? overall;
  const d2b = toNationalScore(readValue(values, headerMap.d2b)) ?? overall;
  const d3b = toNationalScore(readValue(values, headerMap.d3b)) ?? overall;
  const d4a = toNationalScore(readValue(values, headerMap.d4a)) ?? overall;
  const x = toCoordinate(readValue(values, headerMap.x));
  const y = toCoordinate(readValue(values, headerMap.y));

  return { geoid, city, state, zip, overall, d2a, d2b, d3b, d4a, x, y };
}

function makeNeighborhood(row, index) {
  const dailyErrands = clamp(Math.round((row.overall * 4 + row.d2a * 3 + row.d2b * 3) / 10));
  const carLightLiving = clamp(Math.round((row.overall * 6 + row.d3b * 2 + row.d4a * 2) / 10));
  const connectedStreets = clamp(Math.round((row.d3b * 7 + row.overall * 3) / 10));
  const varietyNearby = clamp(Math.round((row.d2a * 5 + row.d2b * 5) / 10));
  const coordinates = row.x !== null && row.y !== null ? projectCoordinates(row.x, row.y) : fallbackCoordinates(index);

  return {
    id: slugify(row.geoid),
    city: row.city,
    state: row.state,
    label: `Block Group ${row.geoid.slice(-4)}`,
    blockGroupId: row.geoid,
    zip: row.zip || "N/A",
    overall: row.overall,
    coordinates,
    categories: [
      {
        key: "dailyErrands",
        label: "Daily Errands",
        score: dailyErrands,
        note: "Derived from walkability and land-use mix inputs."
      },
      {
        key: "carLightLiving",
        label: "Car-Light Living",
        score: carLightLiving,
        note: "Derived from overall walkability plus supportive underlying indicators."
      },
      {
        key: "connectedStreets",
        label: "Connected Streets",
        score: connectedStreets,
        note: "Derived primarily from the EPA street network variable."
      },
      {
        key: "varietyNearby",
        label: "Variety Nearby",
        score: varietyNearby,
        note: "Derived from employment and housing mix variables."
      }
    ],
    summary: makeSummary(dailyErrands, carLightLiving, connectedStreets, varietyNearby),
    interpretation: makeInterpretation(row.overall),
    highlights: [
      `EPA walkability score ${row.overall}`,
      `Imported block group ${row.geoid}`,
      "Interpretation layer, not an EPA official category set"
    ]
  };
}

function makeSummary(dailyErrands, carLightLiving, connectedStreets, varietyNearby) {
  const entries = [
    ["Daily Errands", dailyErrands],
    ["Car-Light Living", carLightLiving],
    ["Connected Streets", connectedStreets],
    ["Variety Nearby", varietyNearby]
  ].sort((a, b) => b[1] - a[1]);

  return `Strongest on ${entries[0][0].toLowerCase()} and weakest on ${entries[3][0].toLowerCase()}.`;
}

function makeInterpretation(score) {
  if (score >= 85) return "Exceptional for settling down car-light";
  if (score >= 75) return "Very walkable for daily routines";
  if (score >= 65) return "Balanced, with some car-light upside";
  return "More selective walking convenience";
}

function projectCoordinates(x, y) {
  return {
    x: clamp(Math.round((((x + 180) / 360) * 80) + 10), 10, 90),
    y: clamp(Math.round((90 - ((y + 90) / 180) * 80)), 10, 90)
  };
}

function fallbackCoordinates(index) {
  const base = [
    { x: 24, y: 58 },
    { x: 43, y: 34 },
    { x: 61, y: 49 },
    { x: 76, y: 28 },
    { x: 57, y: 69 },
    { x: 31, y: 24 },
    { x: 69, y: 63 },
    { x: 47, y: 19 }
  ];

  return base[index % base.length];
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function readValue(values, index) {
  if (index === undefined) return "";
  return (values[index] || "").trim();
}

function toScore(value) {
  if (!value) return null;
  const number = Number.parseFloat(String(value));
  if (!Number.isFinite(number)) return null;
  return clamp(Math.round(number));
}

function toNationalScore(value) {
  if (!value) return null;
  const number = Number.parseFloat(String(value));
  if (!Number.isFinite(number)) return null;

  if (number <= 20) {
    return clamp(Math.round(number * 5));
  }

  return clamp(Math.round(number));
}

function toCoordinate(value) {
  if (!value) return null;
  const number = Number.parseFloat(String(value));
  return Number.isFinite(number) ? number : null;
}

function normalizeGeoid(value) {
  if (!value) return "";

  const cleaned = String(value).trim();
  if (/^\d+$/.test(cleaned)) return cleaned;

  const numeric = Number(cleaned);
  if (Number.isFinite(numeric)) {
    return numeric.toFixed(0);
  }

  return cleaned;
}

function normalizeState(rawState, cityValue) {
  const cleaned = String(rawState || "").trim();
  if (STATEFP_TO_ABBR[cleaned]) return STATEFP_TO_ABBR[cleaned];
  if (/^[A-Z]{2}$/.test(cleaned)) return cleaned;

  const cityMatch = String(cityValue || "").match(/,\s*([A-Z]{2})(?:-[A-Z]{2})?$/);
  if (cityMatch) return cityMatch[1];

  return "US";
}

function normalizeCity(rawCity, state) {
  const cleaned = String(rawCity || "").trim();
  if (!cleaned) return `Local areas in ${state}`;

  if (cleaned.includes(",")) return cleaned;
  return `${cleaned}, ${state}`;
}

function clamp(value, min = 1, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
