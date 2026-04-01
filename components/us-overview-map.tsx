"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl, { GeoJSONSource, LngLatBoundsLike } from "maplibre-gl";
import { CategoryKey, Neighborhood, Place } from "@/lib/types";
import { pseudoToLngLat } from "@/lib/utils";

type LensKey = "overall" | CategoryKey;

type UsOverviewMapProps = {
  places: Place[];
  activeLens: LensKey;
  featured: Neighborhood | null;
  onSelectNeighborhood: (place: Place, neighborhood: Neighborhood) => void;
};

const STYLE_URL = "https://demotiles.maplibre.org/style.json";
const USA_BOUNDS: LngLatBoundsLike = [
  [-168, 15],
  [-52, 72]
];

function getLensScore(neighborhood: Neighborhood, lens: LensKey) {
  if (lens === "overall") return neighborhood.overall;
  return neighborhood.categories.find((item) => item.key === lens)?.score ?? neighborhood.overall;
}

export function UsOverviewMap({
  places,
  activeLens,
  featured,
  onSelectNeighborhood
}: UsOverviewMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onSelectRef = useRef(onSelectNeighborhood);

  onSelectRef.current = onSelectNeighborhood;

  const features = useMemo(() => {
    return places
      .map((place) => {
        const topNeighborhood = [...place.neighborhoods].sort(
          (a, b) => getLensScore(b, activeLens) - getLensScore(a, activeLens)
        )[0];

        if (!topNeighborhood) return null;

        const { lng, lat } = pseudoToLngLat(topNeighborhood.coordinates);

        return {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [lng, lat]
          },
          properties: {
            featureId: topNeighborhood.id,
            placeId: place.id,
            label: `${place.city}, ${place.state}`,
            neighborhoodId: topNeighborhood.id,
            neighborhoodLabel: topNeighborhood.label,
            score: getLensScore(topNeighborhood, activeLens),
            isFeatured: featured?.id === topNeighborhood.id ? 1 : 0
          }
        };
      })
      .filter((feature): feature is NonNullable<typeof feature> => feature !== null);
  }, [activeLens, featured?.id, places]);

  const featuresRef = useRef(features);

  featuresRef.current = features;

  const featureLookup = useMemo(() => {
    const entries = new Map<string, { place: Place; neighborhood: Neighborhood }>();

    for (const place of places) {
      for (const neighborhood of place.neighborhoods) {
        entries.set(neighborhood.id, { place, neighborhood });
      }
    }

    return entries;
  }, [places]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: STYLE_URL,
      center: [-98.5, 38.5],
      zoom: 2.65,
      minZoom: 2.2,
      maxZoom: 6,
      maxBounds: USA_BOUNDS,
      attributionControl: false,
      renderWorldCopies: false
    });

    mapRef.current = map;
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    map.on("load", () => {
      map.addSource("overview-points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: featuresRef.current
        }
      });

      map.addLayer({
        id: "overview-point-halo",
        type: "circle",
        source: "overview-points",
        paint: {
          "circle-radius": [
            "case",
            ["==", ["get", "isFeatured"], 1],
            ["+", ["interpolate", ["linear"], ["get", "score"], 40, 6, 95, 11], 4],
            0
          ],
          "circle-color": "rgba(15, 23, 42, 0.12)"
        }
      });

      map.addLayer({
        id: "overview-points-fill",
        type: "circle",
        source: "overview-points",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "score"], 40, 4, 95, 9],
          "circle-stroke-width": [
            "case",
            ["==", ["get", "isFeatured"], 1],
            1.4,
            0.6
          ],
          "circle-stroke-color": [
            "case",
            ["==", ["get", "isFeatured"], 1],
            "#111827",
            "rgba(17,24,39,0.25)"
          ],
          "circle-color": [
            "step",
            ["get", "score"],
            "#737373",
            56,
            "#d4d4d8",
            66,
            "#fca5a5",
            76,
            "#ef4444",
            86,
            "#b91c1c"
          ],
          "circle-opacity": 0.92
        }
      });

      map.on("mouseenter", "overview-points-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "overview-points-fill", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "overview-points-fill", (event) => {
        const feature = event.features?.[0];
        const neighborhoodId = feature?.properties?.neighborhoodId;
        if (!neighborhoodId) return;

        const match = featureLookup.get(neighborhoodId);
        if (match) {
          onSelectRef.current(match.place, match.neighborhood);
        }
      });

      map.fitBounds(USA_BOUNDS, {
        padding: 18,
        duration: 0
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [featureLookup]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource("overview-points") as GeoJSONSource | undefined;
    if (!source) return;

    source.setData({
      type: "FeatureCollection",
      features
    });
  }, [features]);

  return <div ref={mapContainerRef} className="h-[400px] w-full overflow-hidden rounded-[20px]" />;
}
