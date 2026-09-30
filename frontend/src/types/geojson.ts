/**
 * Typed GeoJSON interfaces for CycloneShield AI map layers.
 *
 * All coordinates follow the GeoJSON spec: [longitude, latitude] (x, y).
 * When passing to Leaflet, swap to [latitude, longitude].
 *
 * These interfaces describe the exact shapes returned by the backend
 * /api/risk/layers endpoint. They are NOT generic GeoJSON — they carry
 * CycloneShield-specific property schemas.
 */

// ---------------------------------------------------------------------------
// Base GeoJSON primitives
// ---------------------------------------------------------------------------

export type Longitude = number;
export type Latitude = number;
export type LngLatTuple = [Longitude, Latitude];

export type GeoJSONGeometryType =
  | 'Point'
  | 'LineString'
  | 'Polygon'
  | 'MultiPolygon'
  | 'MultiLineString';

export interface PointGeometry {
  type: 'Point';
  coordinates: LngLatTuple;
}

export interface LineStringGeometry {
  type: 'LineString';
  coordinates: LngLatTuple[];
}

export interface PolygonGeometry {
  type: 'Polygon';
  /** Outer ring only (index 0). Interior rings (holes) ignored by renderer. */
  coordinates: LngLatTuple[][];
}

export interface MultiPolygonGeometry {
  type: 'MultiPolygon';
  coordinates: LngLatTuple[][][];
}

export type GeoJSONGeometry =
  | PointGeometry
  | LineStringGeometry
  | PolygonGeometry
  | MultiPolygonGeometry;

// ---------------------------------------------------------------------------
// Layer-specific feature property schemas
// ---------------------------------------------------------------------------

/** Properties on each wind-swath Polygon feature */
export interface WindSwathProperties {
  name: string;
  /** e.g. "120–180" */
  wind_speed_range_kmh: string;
  /** e.g. "High structural risk" */
  structural_risk: string;
  /** e.g. "core_swath" | "outer_swath" */
  zone_type: string;
  /** CycloneShield deterministic screening model */
  model_source: string;
  /** ISO 8601 timestamp string when layer was computed */
  layer_timestamp: string;
  screening_disclaimer: string;
}

/** Properties on each coastal-surge-zone Polygon feature */
export interface SurgeZoneProperties {
  name: string;
  /** Estimated surge height in metres (screening value) */
  modeled_surge_height_m: string;
  /** e.g. "High surge inundation risk" */
  risk_level: string;
  /** Metres above mean sea level */
  elevation_threshold_m: number;
  model_source: string;
  layer_timestamp: string;
  screening_disclaimer: string;
}

/** Properties on each flood-susceptibility-zone Polygon feature */
export interface FloodZoneProperties {
  name: string;
  /** Estimated ponding depth in metres */
  est_ponding_depth_m: string;
  description: string;
  model_source: string;
  layer_timestamp: string;
  screening_disclaimer?: string;
}

/** Properties on each flagged road-segment LineString feature */
export interface RoadSegmentProperties {
  name: string;
  /** e.g. "HIGH_DISRUPTION_RISK" */
  screening_status: string;
  /** e.g. "Located within Gale Wind Swath + Surge Zone" */
  hazard_overlap: string;
  /** Road type (NH / SH / etc.) */
  road_type?: string;
  model_source: string;
  layer_timestamp: string;
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// Typed GeoJSON Feature wrappers
// ---------------------------------------------------------------------------

export interface WindSwathFeature {
  id: string;
  type: 'Feature';
  geometry: PolygonGeometry;
  properties: WindSwathProperties;
}

export interface SurgeZoneFeature {
  id: string;
  type: 'Feature';
  geometry: PolygonGeometry;
  properties: SurgeZoneProperties;
}

export interface FloodZoneFeature {
  id: string;
  type: 'Feature';
  geometry: PolygonGeometry;
  properties: FloodZoneProperties;
}

export interface RoadSegmentFeature {
  id: string;
  type: 'Feature';
  geometry: LineStringGeometry;
  properties: RoadSegmentProperties;
}

// ---------------------------------------------------------------------------
// Risk Layers response envelope
// (mirrors backend RiskLayersData type but uses stricter property types)
// ---------------------------------------------------------------------------

export interface TypedRiskLayersData {
  scenario_id: string;
  mode: 'live' | 'screening_ready' | 'demo';
  generated_at: string;
  wind_swaths: WindSwathFeature[];
  composite_zones?: WindSwathFeature[] | SurgeZoneFeature[] | FloodZoneFeature[];
  flagged_road_segments: RoadSegmentFeature[];
  elevation_layers?: FloodZoneFeature[];
  rainfall_layers?: FloodZoneFeature[];
}
