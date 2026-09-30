import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Popup,
  Polyline,
  Polygon,
  CircleMarker,
  useMap
} from 'react-leaflet';
import { AlertTriangle, Layers } from 'lucide-react';
import { CycloneScenario, InfrastructureAsset, RiskLayersData } from '../../types';
import { MapLayerControls } from './MapLayerControls';
import { MapLegend } from './MapLegend';
import { AssetInspectorDrawer } from './AssetInspectorDrawer';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

interface RiskMapCanvasProps {
  scenario: CycloneScenario | null;
  assets: InfrastructureAsset[];
  riskLayers: RiskLayersData | null;
  loading?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  hospital: '#ef4444',
  shelter: '#10b981',
  power_substation: '#f59e0b',
  port: '#06b6d4',
  telecom_tower: '#a78bfa',
  water_treatment: '#34d399',
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#8b5cf6';
}

function geoToLeaflet(coords: [number, number][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng]);
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export const RiskMapCanvas: React.FC<RiskMapCanvasProps> = ({
  scenario,
  assets,
  riskLayers,
  loading = false,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<InfrastructureAsset | null>(null);

  // Layer visibility state
  const [showElevation, setShowElevation] = useState(false);
  const [showRainfall, setShowRainfall] = useState(true);
  const [showFlood, setShowFlood] = useState(true);
  const [showSurge, setShowSurge] = useState(true);
  const [showWind, setShowWind] = useState(true);
  const [showComposite, setShowComposite] = useState(false);
  const [showRoads, setShowRoads] = useState(true);
  const [showTrack, setShowTrack] = useState(true);
  const [showAssets, setShowAssets] = useState(true);

  // Opacity controls
  const [elevationOpacity, setElevationOpacity] = useState(0.25);
  const [rainfallOpacity, setRainfallOpacity] = useState(0.30);
  const [floodOpacity, setFloodOpacity] = useState(0.35);
  const [surgeOpacity, setSurgeOpacity] = useState(0.40);
  const [windOpacity, setWindOpacity] = useState(0.20);
  const [compositeOpacity, setCompositeOpacity] = useState(0.25);
  const [roadsOpacity, setRoadsOpacity] = useState(0.90);

  // Basemap tile selector & error state
  const [basemap, setBasemap] = useState<'dark' | 'satellite' | 'street'>('dark');
  const [tileError, setTileError] = useState(false);

  // Map view bounds (Coastal AP focus)
  const DEFAULT_CENTER: [number, number] = [16.8, 82.2];
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(8);

  const isDemo = !riskLayers || riskLayers.mode !== 'live';

  const resetView = () => {
    setMapCenter(DEFAULT_CENTER);
    setMapZoom(8);
  };

  const zoomIn = () => setMapZoom((z) => Math.min(z + 1, 18));
  const zoomOut = () => setMapZoom((z) => Math.max(z - 1, 4));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full bg-slate-950">
        <LoadingState message="Loading geospatial layers…" subtext="Fetching risk data from backend" />
      </div>
    );
  }

  if (!riskLayers && !scenario) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full bg-slate-950">
        <EmptyState
          icon={Layers}
          title="No Scenario Selected"
          description="Select a scenario from the header dropdown to view geospatial hazard overlays."
        />
      </div>
    );
  }

  const layerConfigs = [
    {
      id: 'elevation',
      label: 'Terrain Elevation (<5m)',
      colorClass: 'bg-emerald-400',
      checked: showElevation,
      onChange: setShowElevation,
      opacity: elevationOpacity,
      onOpacityChange: setElevationOpacity,
      source: riskLayers?.elevation_layers?.[0]?.properties?.model_source || 'NASA SRTM 30m DEM',
      timestamp: riskLayers?.timestamp,
      isDemo,
    },
    {
      id: 'rainfall',
      label: 'Rainfall Accumulation (>200mm)',
      colorClass: 'bg-blue-400',
      checked: showRainfall,
      onChange: setShowRainfall,
      opacity: rainfallOpacity,
      onOpacityChange: setRainfallOpacity,
      source: riskLayers?.rainfall_layers?.[0]?.properties?.model_source || 'CHIRPS Daily / IMD',
      timestamp: riskLayers?.timestamp,
      isDemo,
    },
    {
      id: 'flood',
      label: 'Flood Ponding (DEM/SAR)',
      colorClass: 'bg-cyan-400',
      checked: showFlood,
      onChange: setShowFlood,
      opacity: floodOpacity,
      onOpacityChange: setFloodOpacity,
      source: riskLayers?.flood_zones?.[0]?.properties?.model_source,
      timestamp: riskLayers?.timestamp,
      isDemo,
    },
    {
      id: 'surge',
      label: 'Coastal Surge Susceptibility',
      colorClass: 'bg-fuchsia-400',
      checked: showSurge,
      onChange: setShowSurge,
      opacity: surgeOpacity,
      onOpacityChange: setSurgeOpacity,
      source: riskLayers?.surge_zones?.[0]?.properties?.model_source,
      timestamp: riskLayers?.timestamp,
      isDemo,
    },
    {
      id: 'wind',
      label: 'Gale Wind Swaths',
      colorClass: 'bg-red-400',
      checked: showWind,
      onChange: setShowWind,
      opacity: windOpacity,
      onOpacityChange: setWindOpacity,
      source: riskLayers?.wind_swaths?.[0]?.properties?.model_source,
      timestamp: riskLayers?.timestamp,
      isDemo,
    },
    {
      id: 'composite',
      label: 'Composite Multi-Hazard Risk',
      colorClass: 'bg-purple-400',
      checked: showComposite,
      onChange: setShowComposite,
      opacity: compositeOpacity,
      onOpacityChange: setCompositeOpacity,
      source: 'CycloneShield Integrated Multi-Hazard Model',
      timestamp: riskLayers?.timestamp,
      isDemo,
    },
    {
      id: 'roads',
      label: 'Flagged Highways',
      colorClass: 'bg-amber-400',
      checked: showRoads,
      onChange: setShowRoads,
      opacity: roadsOpacity,
      onOpacityChange: setRoadsOpacity,
      source: riskLayers?.flagged_road_segments?.[0]?.properties?.model_source,
      timestamp: riskLayers?.timestamp,
      isDemo,
    },
    {
      id: 'track',
      label: 'Cyclone Track & Cone',
      colorClass: 'bg-red-500 rounded-full',
      checked: showTrack,
      onChange: setShowTrack,
      opacity: 1,
      onOpacityChange: () => {},
      source: scenario?.source_attribution,
      timestamp: scenario?.data_timestamp,
    },
    {
      id: 'assets',
      label: 'Critical Infrastructure',
      colorClass: 'bg-emerald-400 rounded-full',
      checked: showAssets,
      onChange: setShowAssets,
      opacity: 1,
      onOpacityChange: () => {},
      source: 'APSDMA & OSM Verified',
    },
  ];

  return (
    <div className="relative h-[calc(100vh-120px)] w-full flex overflow-hidden">
      {/* Map Canvas */}
      <div className="flex-1 relative h-full">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={mapZoom}
          scrollWheelZoom={true}
          zoomControl={false}
          className="h-full w-full z-0"
        >
          <ChangeView center={mapCenter} zoom={mapZoom} />

          {/* Basemap tile choices */}
          {basemap === 'dark' && (
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
              eventHandlers={{ tileerror: () => setTileError(true) }}
            />
          )}
          {basemap === 'satellite' && (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com">Esri World Imagery</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
              eventHandlers={{ tileerror: () => setTileError(true) }}
            />
          )}
          {basemap === 'street' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              eventHandlers={{ tileerror: () => setTileError(true) }}
            />
          )}

          {/* 1. TERRAIN ELEVATION (<5m ASL) */}
          {showElevation && riskLayers?.elevation_layers?.map((layer) => {
            const coords = geoToLeaflet(layer.geometry.coordinates[0] as [number, number][]);
            return (
              <Polygon
                key={layer.id}
                positions={coords}
                pathOptions={{
                  color: '#10b981',
                  fillColor: '#10b981',
                  fillOpacity: elevationOpacity,
                  weight: 1.5,
                  dashArray: '3, 3'
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1 min-w-[180px]">
                    <strong className="text-emerald-400 block font-semibold">{layer.properties.name}</strong>
                    <div>Elevation Range: {layer.properties.elevation_range}</div>
                    <div className="text-slate-400">{layer.properties.description}</div>
                    <div className="text-[10px] text-slate-500">Source: {layer.properties.model_source}</div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* 2. RAINFALL ACCUMULATION (>200mm) */}
          {showRainfall && riskLayers?.rainfall_layers?.map((layer) => {
            const coords = geoToLeaflet(layer.geometry.coordinates[0] as [number, number][]);
            return (
              <Polygon
                key={layer.id}
                positions={coords}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: rainfallOpacity,
                  weight: 1.5
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1 min-w-[180px]">
                    <strong className="text-blue-400 block font-semibold">{layer.properties.name}</strong>
                    <div>Forecast Accumulation: {layer.properties.rainfall_accumulation_mm}</div>
                    <div className="text-slate-400">{layer.properties.description}</div>
                    <div className="text-[10px] text-slate-500">Source: {layer.properties.model_source}</div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* 3. GALE WIND SWATHS */}
          {showWind && riskLayers?.wind_swaths?.map((swath) => {
            const coords = geoToLeaflet(swath.geometry.coordinates[0] as [number, number][]);
            const isCore = swath.id.includes('core');
            return (
              <Polygon
                key={swath.id}
                positions={coords}
                pathOptions={{
                  color: isCore ? '#ef4444' : '#f97316',
                  fillColor: isCore ? '#ef4444' : '#f97316',
                  fillOpacity: isCore ? windOpacity + 0.05 : windOpacity * 0.6,
                  weight: 1.5,
                  dashArray: isCore ? undefined : '4, 4'
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1 min-w-[180px]">
                    <strong className="text-amber-400 block font-semibold">{swath.properties.name}</strong>
                    <div>Wind: {swath.properties.wind_speed_range_kmh}</div>
                    <div className="text-slate-400">{swath.properties.structural_risk}</div>
                    <div className="text-[10px] text-slate-500">Source: {swath.properties.model_source}</div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* 4. COASTAL SURGE STRIPS */}
          {showSurge && riskLayers?.surge_zones?.map((surge) => {
            const coords = geoToLeaflet(surge.geometry.coordinates[0] as [number, number][]);
            return (
              <Polygon
                key={surge.id}
                positions={coords}
                pathOptions={{
                  color: '#d946ef',
                  fillColor: '#d946ef',
                  fillOpacity: surgeOpacity,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1 min-w-[180px]">
                    <strong className="text-fuchsia-300 block font-semibold">{surge.properties.name}</strong>
                    <div>Est. Surge: {surge.properties.modeled_surge_height_m}</div>
                    <div className="text-[10px] text-slate-500">Source: {surge.properties.model_source}</div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* 5. FLOOD SUSCEPTIBILITY ZONES */}
          {showFlood && riskLayers?.flood_zones?.map((flood) => {
            const coords = geoToLeaflet(flood.geometry.coordinates[0] as [number, number][]);
            return (
              <Polygon
                key={flood.id}
                positions={coords}
                pathOptions={{
                  color: '#06b6d4',
                  fillColor: '#06b6d4',
                  fillOpacity: floodOpacity,
                  weight: 1.5
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1 min-w-[180px]">
                    <strong className="text-cyan-400 block font-semibold">{flood.properties.name}</strong>
                    <div>Ponding Depth: {flood.properties.est_ponding_depth_m}</div>
                    <div className="text-slate-400">{flood.properties.description}</div>
                    <div className="text-[10px] text-slate-500">Source: {flood.properties.model_source}</div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* 6. COMPOSITE MULTI-HAZARD RISK */}
          {showComposite && riskLayers?.composite_zones?.map((comp, idx) => {
            const coords = geoToLeaflet(comp.geometry.coordinates[0] as [number, number][]);
            return (
              <Polygon
                key={`comp_${idx}`}
                positions={coords}
                pathOptions={{
                  color: '#a855f7',
                  fillColor: '#a855f7',
                  fillOpacity: compositeOpacity,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1 min-w-[180px]">
                    <strong className="text-purple-400 block font-semibold">Composite Multi-Hazard Overlay</strong>
                    <div className="text-slate-300">Overlapping surge & flood ponding zone</div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* 7. FLAGGED HIGHWAY SEGMENTS */}
          {showRoads && riskLayers?.flagged_road_segments?.map((road) => {
            const coords = geoToLeaflet(road.geometry.coordinates as [number, number][]);
            return (
              <Polyline
                key={road.id}
                positions={coords}
                pathOptions={{
                  color: '#f59e0b',
                  weight: 5,
                  dashArray: '8, 8',
                  opacity: roadsOpacity
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1 min-w-[180px]">
                    <strong className="text-amber-400 block font-semibold">{road.properties.name}</strong>
                    <div className="text-red-400 font-medium">Status: {road.properties.screening_status}</div>
                    <div className="text-slate-300">{road.properties.hazard_overlap}</div>
                    <div className="text-[10px] text-slate-500 italic">{road.properties.disclaimer}</div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* 8. CYCLONE FORECAST TRACK & CONE */}
          {showTrack && scenario && (
            <>
              {scenario.forecast_cone && (
                <Polygon
                  positions={scenario.forecast_cone.cone_polygon}
                  pathOptions={{
                    color: '#64748b',
                    fillColor: '#94a3b8',
                    fillOpacity: 0.15,
                    dashArray: '5, 5',
                    weight: 1
                  }}
                />
              )}

              <Polyline
                positions={scenario.track_points.map((pt) => [pt.lat, pt.lon])}
                pathOptions={{ color: '#ef4444', weight: 3, opacity: 0.85 }}
              />

              {scenario.track_points.map((pt, idx) => (
                <CircleMarker
                  key={idx}
                  center={[pt.lat, pt.lon]}
                  radius={pt.status === 'current' ? 9 : 5}
                  pathOptions={{
                    color: pt.status === 'current' ? '#ffffff' : '#ef4444',
                    fillColor: pt.status === 'current' ? '#ef4444' : '#ffffff',
                    fillOpacity: 0.9,
                    weight: pt.status === 'current' ? 3 : 1.5
                  }}
                >
                  <Popup>
                    <div className="text-xs space-y-1">
                      <strong className="text-red-400 font-semibold">{pt.category}</strong>
                      <div>Wind: {pt.wind_kmh} km/h</div>
                      <div>Status: {pt.status.replace('_', ' ')}</div>
                      <div className="text-[10px] text-slate-400">{new Date(pt.timestamp).toUTCString()}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </>
          )}

          {/* 9. CRITICAL INFRASTRUCTURE MARKERS */}
          {showAssets && assets.map((asset) => {
            const color = getCategoryColor(asset.category);
            return (
              <CircleMarker
                key={asset.id}
                center={[asset.lat, asset.lon]}
                radius={7}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: color,
                  fillOpacity: 0.95,
                  weight: 1.5
                }}
                eventHandlers={{ click: () => setSelectedAsset(asset) }}
              >
                <Popup>
                  <div className="text-xs space-y-1.5 min-w-[200px]">
                    <div className="font-semibold text-slate-100">{asset.name}</div>
                    <div className="flex items-center space-x-1.5">
                      <span className="capitalize text-slate-400">{asset.category.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-mono">
                        {asset.risk_level} ({asset.risk_score?.toFixed(0)}/100)
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedAsset(asset)}
                      className="mt-1 text-[11px] text-cyan-400 hover:underline block font-medium"
                    >
                      Inspect Vulnerability Breakdown →
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Floating Tile Error Warning */}
        {tileError && (
          <div className="absolute top-16 right-4 z-[450] bg-red-950/90 border border-red-700 text-red-200 text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>Tile loading error detected. Try switching basemaps.</span>
            <button
              onClick={() => setTileError(false)}
              className="text-red-400 hover:text-white font-mono ml-2 text-[10px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Floating DEMO Badge */}
        {isDemo && (
          <div className="absolute top-4 right-4 z-[450] flex items-center space-x-1.5 bg-amber-950/90 border border-amber-700/60 text-amber-300 text-[10px] font-mono px-2.5 py-1 rounded-lg shadow-lg backdrop-blur">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>DEMO DATA — Screening Simulation</span>
          </div>
        )}

        {/* Floating Layer Controls (Top Left) */}
        <div className="absolute top-4 left-4 z-[400]">
          <MapLayerControls
            layers={layerConfigs}
            basemap={basemap}
            onBasemapChange={setBasemap}
            onResetView={resetView}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            currentZoom={mapZoom}
          />
        </div>

        {/* Floating Map Legend (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-[400] hidden sm:block">
          <MapLegend isDemo={isDemo} />
        </div>
      </div>

      {/* Asset Inspector Slide-Out Drawer (Right) */}
      {selectedAsset && (
        <AssetInspectorDrawer
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
};
