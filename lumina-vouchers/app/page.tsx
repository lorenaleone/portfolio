'use client';

import { useState } from 'react';
import { ConfigForm } from '@/components/ConfigForm';
import { VoucherForm } from '@/components/VoucherForm';
import { VoucherPreview } from '@/components/VoucherPreview';
import { Welcome } from '@/components/Welcome';
import { useAgencyConfig } from '@/hooks/useAgencyConfig';
import { storage } from '@/lib/storage';
import { VoucherData, VoucherFull, AgencyConfig } from '@/lib/types';

export default function Home() {
  const { config, updateConfig, loaded, isConfigured } = useAgencyConfig();
  const [currentVoucher, setCurrentVoucher] = useState<VoucherFull | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [welcomeShown, setWelcomeShown] = useState(false);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const showWelcome = !isConfigured && !welcomeShown;

  if (showWelcome) {
    return (
      <Welcome
        onStart={() => {
          setWelcomeShown(true);
          setConfigOpen(true);
        }}
      />
    );
  }

  const handleVoucherSubmit = (data: VoucherData) => {
    const voucher: VoucherFull = {
      ...data,
      agency: config,
      generatedAt: new Date().toISOString(),
      id: generateId(),
    };
    storage.addToHistory(voucher);
    setCurrentVoucher(voucher);
  };

  const handleConfigSave = (next: AgencyConfig) => {
    updateConfig(next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50">
      <header
        className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100"
        style={{ paddingTop: 'var(--safe-top)' }}
      >
        <div className="max-w-md mx-auto px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {config.logoDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={config.logoDataUrl}
                alt={config.name}
                className="w-10 h-10 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-lg"
                style={{ background: config.brandColor }}
              >
                {config.name ? config.name.charAt(0).toUpperCase() : '✨'}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-gray-900 text-sm truncate">
                {config.name || 'Lumina Vouchers'}
              </h1>
              <p className="text-xs text-gray-500">Novo voucher</p>
            </div>
          </div>
          <button
            onClick={() => setConfigOpen(true)}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition shrink-0"
            aria-label="Configurações"
          >
            <SettingsIcon />
          </button>
        </div>
      </header>

      <main
        className="max-w-md mx-auto px-5 py-6"
        style={{ paddingBottom: 'calc(2rem + var(--safe-bottom))' }}
      >
        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-5 mb-4">
          <VoucherForm onSubmit={handleVoucherSubmit} />
        </div>

        <p className="text-xs text-gray-500 text-center px-4">
          ✨ Gerado com Lumina Vouchers · Seu voucher fica salvo apenas no seu dispositivo
        </p>
      </main>

      <ConfigForm
        open={configOpen}
        config={config}
        onSave={handleConfigSave}
        onClose={() => setConfigOpen(false)}
      />

      {currentVoucher && (
        <VoucherPreview
          voucher={currentVoucher}
          onClose={() => setCurrentVoucher(null)}
        />
      )}
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function generateId(): string {
  const date = new Date();
  const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${yymmdd}-${rand}`;
}
