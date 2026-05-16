'use client';

import { useState } from 'react';
import { AgencyConfig } from '@/lib/types';
import { recordPayment } from '@/hooks/useSubscription';

interface PaywallModalProps {
  open: boolean;
  vouchersUsed: number;
  vouchersLimit: number;
  onClose: () => void;
  onSuccess?: () => void;
  config: AgencyConfig;
}

export function PaywallModal({
  open,
  vouchersUsed,
  vouchersLimit,
  onClose,
  onSuccess,
  config,
}: PaywallModalProps) {
  const [loading, setLoading] = useState(false);
  const [billingType, setBillingType] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleUpgrade = async () => {
    if (!config.name || !config.whatsappNumber) {
      setError('Configure seu WhatsApp e nome da agência primeiro');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/asaas/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `${config.name.toLowerCase().replace(/\s+/g, '-')}@lumina.local`,
          name: config.name,
          billingType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao processar pagamento');
        setLoading(false);
        return;
      }

      // Registra pagamento localmente
      recordPayment(
        `${config.name}@lumina.local`,
        data.subscriptionId
      );

      // Abre link de pagamento se houver
      if (data.invoiceUrl) {
        window.open(data.invoiceUrl, '_blank');
      }

      setLoading(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full animate-scale-in shadow-large"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">⭐</span>
            <h2 className="text-2xl font-bold text-gray-900">Upgrade Pro</h2>
          </div>
          <p className="text-gray-600">
            Você usou {vouchersUsed}/{vouchersLimit} vouchers grátis este mês
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Features */}
          <div className="space-y-3">
            <Feature icon="♾️" text="Vouchers ilimitados" />
            <Feature icon="🎨" text="Sem branding Lumina" />
            <Feature icon="☁️" text="Histórico na nuvem" />
            <Feature icon="⚡" text="Suporte rápido" />
          </div>

          {/* Billing type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Forma de pagamento
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setBillingType('PIX')}
                className={`py-3 rounded-xl font-semibold transition ${
                  billingType === 'PIX'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                🏦 Pix
              </button>
              <button
                onClick={() => setBillingType('CREDIT_CARD')}
                className={`py-3 rounded-xl font-semibold transition ${
                  billingType === 'CREDIT_CARD'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                💳 Cartão
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="bg-gradient-to-r from-brand-50 to-blue-50 rounded-2xl p-4 text-center">
            <p className="text-gray-600 text-sm mb-1">Apenas</p>
            <p className="text-4xl font-bold text-brand-600">R$ 29</p>
            <p className="text-gray-600 text-sm">/mês</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white py-4 rounded-2xl font-semibold active:scale-[0.98] transition"
          >
            {loading ? '⏳ Processando...' : '🎉 Desbloquear Pro'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Nenhum cartão salvo. Renovação automática.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <span className="text-gray-800">{text}</span>
    </div>
  );
}
