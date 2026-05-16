import { AgencyConfig, VoucherFull, DEFAULT_AGENCY_CONFIG } from './types';

const KEYS = {
  CONFIG: 'lumina_agency_config',
  HISTORY: 'lumina_voucher_history',
} as const;

const HISTORY_LIMIT = 20;

export const storage = {
  getConfig(): AgencyConfig {
    if (typeof window === 'undefined') return DEFAULT_AGENCY_CONFIG;
    try {
      const raw = localStorage.getItem(KEYS.CONFIG);
      if (!raw) return DEFAULT_AGENCY_CONFIG;
      return { ...DEFAULT_AGENCY_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_AGENCY_CONFIG;
    }
  },

  saveConfig(config: AgencyConfig): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  },

  getHistory(): VoucherFull[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(KEYS.HISTORY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  addToHistory(voucher: VoucherFull): void {
    if (typeof window === 'undefined') return;
    const current = this.getHistory();
    const updated = [voucher, ...current].slice(0, HISTORY_LIMIT);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
  },

  clearHistory(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEYS.HISTORY);
  },
};
