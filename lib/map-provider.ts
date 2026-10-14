export type MapProviderId = "schematic" | "google" | "mapbox" | "2gis" | "corporate-gis";
export type MapPoint = { x: number; y: number };
export type MapRecord = { id: string; location: MapPoint };

/** Adapter boundary for swapping the demo drawing for a GIS SDK. */
export interface MapProviderAdapter {
  id: MapProviderId;
  label: string;
  projectPoint(point: MapPoint): MapPoint;
  supportsLayers: boolean;
  supportsGeocoding: boolean;
}

const adapters: Record<MapProviderId, MapProviderAdapter> = {
  schematic: { id: "schematic", label: "Схематическая карта Казахстана", projectPoint: (p) => p, supportsLayers: true, supportsGeocoding: false },
  google: { id: "google", label: "Google Maps", projectPoint: (p) => p, supportsLayers: true, supportsGeocoding: true },
  mapbox: { id: "mapbox", label: "Mapbox", projectPoint: (p) => p, supportsLayers: true, supportsGeocoding: true },
  "2gis": { id: "2gis", label: "2GIS", projectPoint: (p) => p, supportsLayers: true, supportsGeocoding: true },
  "corporate-gis": { id: "corporate-gis", label: "Корпоративная GIS", projectPoint: (p) => p, supportsLayers: true, supportsGeocoding: true },
};

export function resolveMapProvider(id: MapProviderId = "schematic"): MapProviderAdapter { return adapters[id]; }

/** Demo coordinates use the same normalized 0–100 canvas as the schematic provider. */
export function projectDemoRecord(record: MapRecord, provider: MapProviderAdapter = resolveMapProvider()) {
  return { ...record, position: provider.projectPoint(record.location) };
}
