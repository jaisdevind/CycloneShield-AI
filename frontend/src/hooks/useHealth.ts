import { useState, useEffect } from 'react';
import { api } from '../services/api';

export interface HealthState {
  isHealthy: boolean;
  service: string;
  version: string;
  database: string;
  geminiConfigured: boolean;
  earthEngineMode: string;
  weatherMode: string;
  timestamp: string;
  loading: boolean;
  error: string | null;
}

export function useHealth(pollIntervalMs: number = 30000): HealthState {
  const [health, setHealth] = useState<HealthState>({
    isHealthy: false,
    service: 'CycloneShield AI',
    version: '1.0.0',
    database: 'connecting',
    geminiConfigured: false,
    earthEngineMode: 'checking',
    weatherMode: 'demo',
    timestamp: '',
    loading: true,
    error: null,
  });

  const checkHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealth({
        isHealthy: data.status === 'healthy',
        service: data.service || 'CycloneShield AI',
        version: data.version || '1.0.0',
        database: data.database || 'sqlite_connected',
        geminiConfigured: Boolean(data.gemini_api_configured),
        earthEngineMode: data.earth_engine_mode || 'screening_ready',
        weatherMode: data.weather_mode || 'demo',
        timestamp: data.timestamp || new Date().toISOString(),
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setHealth((prev) => ({
        ...prev,
        isHealthy: false,
        loading: false,
        error: err.message || 'Backend unreachable',
      }));
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, pollIntervalMs);
    return () => clearInterval(interval);
  }, [pollIntervalMs]);

  return health;
}
