'use client';

import { useEffect, useState } from 'react';
import { VoucherData, VoucherFull, EMPTY_VOUCHER } from '@/lib/types';
import { storage } from '@/lib/storage';

interface VoucherFormProps {
  onSubmit: (data: VoucherData) => void;
}

export function VoucherForm({ onSubmit }: VoucherFormProps) {
  const [data, setData] = useState<VoucherData>(EMPTY_VOUCHER);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [recentClients, setRecentClients] = useState<VoucherFull[]>([]);
  const [showQuickFill, setShowQuickFill] = useState(false);

  useEffect(() => {
    // Carregar clientes recentes
    const history = storage.getHistory();
    const unique = Array.from(
      new Map(history.map((v) => [v.customerName, v])).values()
    ).slice(0, 5);
    setRecentClients(unique);
  }, []);

  const update = <K extends keyof VoucherData>(key: K, value: VoucherData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors.has(key)) {
      const next = new Set(errors);
      next.delete(key);
      setErrors(next);
    }
  };

  const quickFill = (voucher: VoucherFull) => {
    setData({
      customerName: voucher.customerName,
      destination: voucher.destination,
      date: '',
      time: voucher.time || '',
      pickupLocation: voucher.pickupLocation,
      passengers: voucher.passengers,
      notes: voucher.notes,
      price: voucher.price,
    });
    setShowQuickFill(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = new Set<string>();
    if (!data.customerName.trim()) newErrors.add('customerName');
    if (!data.destination.trim()) newErrors.add('destination');
    if (!data.date) newErrors.add('date');

    if (newErrors.size > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...data,
      customerName: data.customerName.trim(),
      destination: data.destination.trim(),
      pickupLocation: data.pickupLocation.trim(),
      notes: data.notes?.trim() || undefined,
    });

    // Reset form
    setData(EMPTY_VOUCHER);
  };

  const hasError = (field: string) => errors.has(field);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Quick fill button */}
      {recentClients.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowQuickFill(!showQuickFill)}
            className="w-full text-left px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl font-medium text-brand-700 hover:bg-brand-100 transition text-sm"
          >
            ⚡ Reutilizar dados de clientes recentes
          </button>

          {showQuickFill && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-3 space-y-2 z-10 animate-slide-up">
              {recentClients.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => quickFill(v)}
                  className="w-full text-left p-3 rounded-xl hover:bg-gray-100 transition border border-gray-100"
                >
                  <div className="font-semibold text-gray-900 text-sm">{v.customerName}</div>
                  <div className="text-xs text-gray-500">
                    {v.destination} • {v.passengers} pass.
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Field
        label="Nome do cliente"
        icon="👤"
        required
        error={hasError('customerName')}
      >
        <input
          type="text"
          value={data.customerName}
          onChange={(e) => update('customerName', e.target.value)}
          placeholder="Ex: Maria Silva"
          autoComplete="name"
          className={inputClass(hasError('customerName'))}
        />
      </Field>

      <Field
        label="Destino do passeio"
        icon="🗺️"
        required
        error={hasError('destination')}
      >
        <input
          type="text"
          value={data.destination}
          onChange={(e) => update('destination', e.target.value)}
          placeholder="Ex: Trilha da Cachoeira"
          className={inputClass(hasError('destination'))}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Data" icon="📅" required error={hasError('date')}>
          <input
            type="date"
            value={data.date}
            onChange={(e) => update('date', e.target.value)}
            className={inputClass(hasError('date'))}
          />
        </Field>
        <Field label="Horário" icon="⏰">
          <input
            type="time"
            value={data.time}
            onChange={(e) => update('time', e.target.value)}
            className={inputClass(false)}
          />
        </Field>
      </div>

      <Field label="Local de saída" icon="📍">
        <input
          type="text"
          value={data.pickupLocation}
          onChange={(e) => update('pickupLocation', e.target.value)}
          placeholder="Ex: Hotel Central, Lobby"
          className={inputClass(false)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Passageiros" icon="👥">
          <input
            type="number"
            min="1"
            max="99"
            value={data.passengers}
            onChange={(e) => update('passengers', parseInt(e.target.value) || 1)}
            className={inputClass(false)}
          />
        </Field>
        <Field label="Valor (R$)" icon="💰">
          <input
            type="number"
            min="0"
            step="0.01"
            value={data.price ?? ''}
            onChange={(e) =>
              update('price', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            placeholder="0,00"
            inputMode="decimal"
            className={inputClass(false)}
          />
        </Field>
      </div>

      <Field label="Observações" icon="📝">
        <textarea
          value={data.notes || ''}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Inclusos: transporte, água, lanche..."
          rows={3}
          className={`${inputClass(false)} resize-none`}
        />
      </Field>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-700 text-white py-4 rounded-2xl font-semibold text-base shadow-medium hover:shadow-large active:scale-[0.98] transition-all"
      >
        ✨ Gerar voucher
      </button>
    </form>
  );
}

function Field({
  label,
  icon,
  required,
  error,
  children,
}: {
  label: string;
  icon?: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
        {icon && <span className="text-base">{icon}</span>}
        {label}
        {required && <span className="text-red-500">*</span>}
        {error && <span className="text-xs text-red-500 ml-auto">obrigatório</span>}
      </label>
      {children}
    </div>
  );
}

function inputClass(error: boolean): string {
  return `w-full px-4 py-3 bg-white border ${
    error ? 'border-red-400' : 'border-gray-200'
  } rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition text-gray-900 placeholder:text-gray-400`;
}
