"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl, { GeoJSONSource } from "maplibre-gl";
import { Neighborhood, Place } from "@/lib/types";
import { estimateNeighborhoodLngLat } from "@/lib/utils";

type LocalAreaMapProps = {
  place: Place;
  selected: Neighborhood;
  compareTarget: Neighborhood | null;
  onSelect: (neighborhood: Neighborhood) => void;
};

const STYLE_URL = "https://demotiles.maplibre.org/style.json";

export function LocalAreaMap({
  place,
  selected,
  compareTarget,
  onSelect
}: LocalAreaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onSelectRef = useRef(onSelect);

  onSelectRef.current = onSelect;

  const features = useMemo(() => {
    return place.neighborhoods.map((neighborhood, index) => {
      const { lng, lat } = estimateNeighborhoodLngLat(place, neighborhood, index);
      const state =
        neighborhood.id === selected.id
          ? "selected"
          : neighborhood.id === compareTarget?.id
            ? "compare"
            : "default";

      return {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [lng, lat]
        },
        properties: {
          neighborhoodId: neighborhood.id,
          label: neighborhood.label,
          score: neighborhood.overall,
          state
        }
      };
    });
  }, [compareTarget?.id, place.neighborhoods, selected.id]);

  const featuresRef = useRef(features);

  featuresRef.current = features;

  const neighborhoodLookup = useMemo(() => {
    return new Map(place.neighborhoods.map((neighborhood) => [neighborhood.id, neighborhood]));
  }, [place.neighborhoods]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: STYLE_URL,
      center: [-98, 38],
      zoom: 3.8,
      minZoom: 2.8,
      maxZoom: 12,
      attributionControl: false,
      renderWorldCopies: false
    });

    mapRef.current = map;
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    map.on("load", () => {
      map.addSource("local-areas", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: featuresRef.current
        }
      });

      map.addLayer({
        id: "local-area-halo",
        type: "circle",
        source: "local-areas",
        paint: {
          "circle-radius": [
            "case",
            ["==", ["get", "state"], "selected"],
            16,
            ["==", ["get", "state"], "compare"],
            13,
            0
          ],
          "circle-color": "rgba(255,255,255,0.14)"
        }
      });

      map.addLayer({
        id: "local-area-points",
        type: "circle",
        source: "local-areas",
        paint: {
          "circle-radius": [
            "case",
            ["==", ["get", "state"], "selected"],
            7,
            ["==", ["get", "state"], "compare"],
            6,
            5
          ],
          "circle-stroke-width": [
            "case",
            ["==", ["get", "state"], "selected"],
            1.4,
            0.7
          ],
          "circle-stroke-color": [
            "case",
            ["==", ["get", "state"], "selected"],
            "#ffffff",
            "#111827"
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
          ]
        }
      });

      map.on("mouseenter", "local-area-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "local-area-points", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "local-area-points", (event) => {
        const feature = event.features?.[0];
        const neighborhoodId = feature?.properties?.neighborhoodId;
        if (!neighborhoodId) return;

        const neighborhood = neighborhoodLookup.get(neighborhoodId);
        if (neighborhood) {
          onSelectRef.current(neighborhood);
        }
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [neighborhoodLookup]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource("local-areas") as GeoJSONSource | undefined;
    if (!source) return;

    source.setData({
      type: "FeatureCollection",
      features
    });

    const bounds = new maplibregl.LngLatBounds();
    features.forEach((feature) => {
      bounds.extend(feature.geometry.coordinates as [number, number]);
    });

    if (!bounds.isEmpty()) {
      const west = bounds.getWest();
      const east = bounds.getEast();
      const south = bounds.getSouth();
      const north = bounds.getNorth();
      const lngPad = Math.max((east - west) * 0.75, 2);
      const latPad = Math.max((north - south) * 0.75, 2);

      map.setMaxBounds([
        [west - lngPad, south - latPad],
        [east + lngPad, north + latPad]
      ]);
      map.fitBounds(bounds, {
        padding: 72,
        duration: 700,
        maxZoom: 10
      });
    }
  }, [features, place.id]);

  return <div ref={mapContainerRef} className="h-full min-h-[420px] w-full overflow-hidden rounded-[20px]" />;
}
