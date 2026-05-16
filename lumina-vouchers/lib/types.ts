export interface AgencyConfig {
  name: string;
  whatsappNumber: string;
  brandColor: string;
  logoDataUrl?: string;
  footerText?: string;
}

export interface VoucherData {
  customerName: string;
  destination: string;
  date: string;
  time: string;
  pickupLocation: string;
  passengers: number;
  notes?: string;
  price?: number;
}

export interface VoucherFull extends VoucherData {
  agency: AgencyConfig;
  generatedAt: string;
  id: string;
}

export const DEFAULT_AGENCY_CONFIG: AgencyConfig = {
  name: '',
  whatsappNumber: '',
  brandColor: '#2563EB',
  footerText: 'Obrigado pela preferência! Tenha um excelente passeio.',
};

export const EMPTY_VOUCHER: VoucherData = {
  customerName: '',
  destination: '',
  date: '',
  time: '',
  pickupLocation: '',
  passengers: 1,
  notes: '',
};
