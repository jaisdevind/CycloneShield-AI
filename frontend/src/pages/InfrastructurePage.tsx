import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  Shield,
  Activity,
  Zap,
  Anchor,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { InfrastructureAsset } from '../types';

interface InfrastructurePageProps {
  assets: InfrastructureAsset[];
  onSelectOnMap?: (asset: InfrastructureAsset) => void;
}

export const InfrastructurePage: React.FC<InfrastructurePageProps> = ({ assets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesRisk = selectedRiskLevel === 'all' || asset.risk_level === selectedRiskLevel;
    return matchesSearch && matchesCategory && matchesRisk;
  });

  const getRiskBadgeColor = (level?: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'High': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Moderate': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hospital': return <Activity className="w-4 h-4 text-red-400" />;
      case 'shelter': return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'power_substation': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'port': return <Anchor className="w-4 h-4 text-cyan-400" />;
      default: return <Building2 className="w-4 h-4 text-purple-400" />;
    }
  };

  const totalCapacity = assets
    .filter((a) => a.category === 'shelter')
    .reduce((sum, a) => sum + (a.capacity || 0), 0);

  const criticalCount = assets.filter((a) => a.risk_level === 'Critical').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-cyan-400" />
            <span>Critical Infrastructure & Facility Exposure</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            APSDMA designated cyclone shelters, apex trauma centers, transport spines, and power nodes. Data completeness varies by location (OSM & APSDMA attributed).
          </p>
        </div>

        {/* Aggregate KPI Badges */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg">
            <span className="text-slate-500 block">Total Facilities</span>
            <span className="text-white font-bold text-sm">{assets.length}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg">
            <span className="text-red-400 block">Critical Risk</span>
            <span className="text-red-400 font-bold text-sm">{criticalCount}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg">
            <span className="text-emerald-400 block">Shelter Capacity</span>
            <span className="text-emerald-400 font-bold text-sm">{totalCapacity.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search facility name, district (e.g. Kakinada, Visakhapatnam)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Categories</option>
            <option value="hospital">Hospitals & Trauma</option>
            <option value="shelter">Cyclone Shelters</option>
            <option value="power_substation">Power Substations</option>
            <option value="port">Ports & Maritime</option>
            <option value="road">Highways & Bridges</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedRiskLevel}
            onChange={(e) => setSelectedRiskLevel(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="Critical">Critical (&gt;75)</option>
            <option value="High">High (50 - 75)</option>
            <option value="Moderate">Moderate (25 - 50)</option>
            <option value="Low">Low (&lt;25)</option>
          </select>
        </div>
      </div>

      {/* Infrastructure Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Facility Name & Type</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Elevation / Coast Dist</th>
                <th className="py-3 px-4">Capacity / Structure</th>
                <th className="py-3 px-4">Composite Risk</th>
                <th className="py-3 px-4">Component Scores</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No infrastructure facilities match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const isExpanded = expandedAssetId === asset.id;
                  return (
                    <React.Fragment key={asset.id}>
                      <tr
                        className={`hover:bg-slate-800/50 transition cursor-pointer ${
                          isExpanded ? 'bg-slate-800/40' : ''
                        }`}
                        onClick={() => setExpandedAssetId(isExpanded ? null : asset.id)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                              {getCategoryIcon(asset.category)}
                            </div>
                            <div>
                              <span className="font-semibold text-white block">{asset.name}</span>
                              <span className="text-[11px] text-slate-400 capitalize">
                                {asset.category.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-300">
                          {asset.district}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          <div>{asset.elevation_m.toFixed(1)}m ASL</div>
                          <div className="text-[11px] text-slate-500">{asset.distance_to_coast_km.toFixed(1)}km to shore</div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">
                          <div>{asset.capacity ? `${asset.capacity.toLocaleString()} beds/persons` : 'Infrastructure Asset'}</div>
                          <div className="text-[11px] text-slate-500 capitalize">{asset.structural_type?.replace('_', ' ') || 'Reinforced Concrete'}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold border ${getRiskBadgeColor(
                              asset.risk_level
                            )}`}
                          >
                            {asset.risk_level} • {asset.risk_score?.toFixed(1)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 space-y-0.5">
                          <div>Flood: <span className="text-cyan-400 font-medium">{asset.flood_score?.toFixed(0)}</span></div>
                          <div>Surge: <span className="text-fuchsia-400 font-medium">{asset.surge_score?.toFixed(0)}</span></div>
                          <div>Wind: <span className="text-red-400 font-medium">{asset.wind_score?.toFixed(0)}</span></div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button className="text-slate-400 hover:text-cyan-400 p-1">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Explanation Row */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90 border-t border-b border-slate-800">
                          <td colSpan={7} className="p-4 space-y-3">
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                                Verifiable Vulnerability Assessment & Heuristic Rationale
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                                {asset.explanation}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                              <div>
                                Data Attribution: <span className="text-slate-200">{asset.data_source}</span>
                              </div>
                              <div>
                                Coordinates: <span className="font-mono text-slate-200">{asset.lat.toFixed(4)}°N, {asset.lon.toFixed(4)}°E</span>
                              </div>
                              <div className="text-emerald-400">
                                Status: Verified Spatial Node
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
