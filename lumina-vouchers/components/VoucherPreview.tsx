'use client';

import { useEffect, useState } from 'react';
import { VoucherFull } from '@/lib/types';
import { generateVoucherPDF } from '@/lib/pdf-generator';
import { WhatsAppShare } from './WhatsAppShare';

interface VoucherPreviewProps {
  voucher: VoucherFull;
  onClose: () => void;
}

export function VoucherPreview({ voucher, onClose }: VoucherPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let revokeUrl = '';
    setLoading(true);

    generateVoucherPDF(voucher)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        revokeUrl = url;
        setPdfUrl(url);
        setPdfBlob(blob);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao gerar PDF:', err);
        setLoading(false);
      });

    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [voucher]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `voucher-${sanitize(voucher.customerName)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col animate-fade-in">
      <div className="bg-white sm:max-w-md sm:mx-auto sm:my-6 sm:rounded-3xl flex flex-col flex-1 max-h-screen sm:max-h-[calc(100vh-3rem)] overflow-hidden shadow-large animate-scale-in">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="font-bold text-gray-900">Voucher pronto!</h2>
            <p className="text-xs text-gray-500">{voucher.customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-hidden bg-gray-100 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Gerando voucher...</p>
            </div>
          ) : (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full border-0"
              title="Voucher Preview"
            />
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 space-y-2.5">
          <WhatsAppShare voucher={voucher} pdfBlob={pdfBlob} />
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleDownload}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-800 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <DownloadIcon />
              <span>Baixar</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-2xl font-semibold active:scale-[0.98] transition"
            >
              + Novo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function sanitize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40);
}
