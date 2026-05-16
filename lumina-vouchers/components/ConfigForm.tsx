'use client';

import { useEffect, useState } from 'react';
import { AgencyConfig } from '@/lib/types';

interface ConfigFormProps {
  open: boolean;
  config: AgencyConfig;
  onSave: (config: AgencyConfig) => void;
  onClose: () => void;
}

export function ConfigForm({ open, config, onSave, onClose }: ConfigFormProps) {
  const [data, setData] = useState<AgencyConfig>(config);

  useEffect(() => {
    if (open) setData(config);
  }, [open, config]);

  if (!open) return null;

  const handleSave = () => {
    if (!data.name.trim()) {
      alert('Informe o nome da agência');
      return;
    }
    onSave({
      ...data,
      name: data.name.trim(),
      whatsappNumber: data.whatsappNumber.trim(),
    });
    onClose();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo deve ter menos de 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setData({ ...data, logoDataUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center sm:justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl animate-slide-up shadow-large"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configurar agência</h2>
            <p className="text-xs text-gray-500">Personalize seus vouchers</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <ConfigField label="Nome da agência" icon="🏢" required>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Ex: Turismo Paraíso"
              className="config-input"
            />
          </ConfigField>

          <ConfigField label="WhatsApp" icon="💬">
            <input
              type="tel"
              value={data.whatsappNumber}
              onChange={(e) => setData({ ...data, whatsappNumber: e.target.value })}
              placeholder="+55 11 98765-4321"
              className="config-input"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Com DDI e DDD. Usado para o botão de compartilhar.
            </p>
          </ConfigField>

          <ConfigField label="Cor da marca" icon="🎨">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={data.brandColor}
                  onChange={(e) => setData({ ...data, brandColor: e.target.value })}
                  className="w-14 h-14 rounded-2xl cursor-pointer border-2 border-gray-200"
                />
              </div>
              <input
                type="text"
                value={data.brandColor.toUpperCase()}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#?[0-9A-Fa-f]{0,6}$/.test(v)) {
                    setData({ ...data, brandColor: v.startsWith('#') ? v : `#${v}` });
                  }
                }}
                placeholder="#2563EB"
                maxLength={7}
                className="config-input flex-1 font-mono uppercase"
              />
            </div>
          </ConfigField>

          <ConfigField label="Logo (opcional)" icon="🖼️">
            <div className="flex items-center gap-3">
              {data.logoDataUrl && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.logoDataUrl}
                    alt="Logo"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-200"
                  />
                  <button
                    onClick={() => setData({ ...data, logoDataUrl: undefined })}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              )}
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div className="config-input cursor-pointer hover:bg-gray-50 text-center text-sm text-gray-600">
                  {data.logoDataUrl ? 'Trocar logo' : '+ Adicionar logo'}
                </div>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">Max 2MB · PNG ou JPG</p>
          </ConfigField>

          <ConfigField label="Mensagem do rodapé" icon="✍️">
            <textarea
              value={data.footerText || ''}
              onChange={(e) => setData({ ...data, footerText: e.target.value })}
              placeholder="Ex: Obrigado pela preferência!"
              rows={2}
              className="config-input resize-none"
            />
          </ConfigField>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 space-y-2">
          <button
            onClick={handleSave}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3.5 rounded-2xl font-semibold shadow-medium active:scale-[0.98] transition"
          >
            💾 Salvar configuração
          </button>
        </div>
      </div>

      <style jsx>{`
        :global(.config-input) {
          width: 100%;
          padding: 0.75rem 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          outline: none;
          transition: all 0.15s;
          color: #111827;
        }
        :global(.config-input:focus) {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }
      `}</style>
    </div>
  );
}

function ConfigField({
  label,
  icon,
  required,
  children,
}: {
  label: string;
  icon?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
        {icon && <span>{icon}</span>}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
