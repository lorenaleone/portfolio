'use client';

import { useEffect, useState } from 'react';
import { AgencyConfig, DEFAULT_AGENCY_CONFIG } from '@/lib/types';
import { storage } from '@/lib/storage';

export function useAgencyConfig() {
  const [config, setConfig] = useState<AgencyConfig>(DEFAULT_AGENCY_CONFIG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setConfig(storage.getConfig());
    setLoaded(true);
  }, []);

  const updateConfig = (updates: Partial<AgencyConfig>) => {
    const next = { ...config, ...updates };
    setConfig(next);
    storage.saveConfig(next);
  };

  const isConfigured = Boolean(config.name && config.whatsappNumber);

  return { config, updateConfig, loaded, isConfigured };
}
