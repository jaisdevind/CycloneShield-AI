/**
 * Formatting utilities for CycloneShield AI
 */

export function formatWindSpeed(kmh: number): string {
  return `${kmh.toFixed(0)} km/h`;
}

export function formatRainfall(mm: number): string {
  return `${mm.toFixed(0)} mm`;
}

export function formatSurge(meters: number): string {
  return `${meters.toFixed(1)} m`;
}

export function formatRiskLevelClass(level?: string): string {
  switch (level) {
    case 'Critical':
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    case 'High':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    case 'Moderate':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    default:
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }
}
