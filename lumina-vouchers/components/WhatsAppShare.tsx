'use client';

import { VoucherFull } from '@/lib/types';

interface WhatsAppShareProps {
  voucher: VoucherFull;
  pdfBlob: Blob | null;
}

export function WhatsAppShare({ voucher, pdfBlob }: WhatsAppShareProps) {
  const buildMessage = () => {
    const lines = [
      `🎫 *Voucher de Passeio*`,
      ``,
      `👤 *Cliente:* ${voucher.customerName}`,
      `🗺️ *Destino:* ${voucher.destination}`,
      `📅 *Data:* ${formatDate(voucher.date)}`,
    ];

    if (voucher.time) lines.push(`⏰ *Horário:* ${voucher.time}`);
    if (voucher.pickupLocation) lines.push(`📍 *Saída:* ${voucher.pickupLocation}`);
    lines.push(`👥 *Passageiros:* ${voucher.passengers}`);

    if (voucher.price && voucher.price > 0) {
      lines.push(`💰 *Valor:* R$ ${voucher.price.toFixed(2).replace('.', ',')}`);
    }

    if (voucher.notes) {
      lines.push('');
      lines.push(`📝 ${voucher.notes}`);
    }

    lines.push('');
    lines.push(`_Voucher emitido por ${voucher.agency.name}_`);

    return lines.join('\n');
  };

  const handleShareText = () => {
    const msg = encodeURIComponent(buildMessage());
    const phone = voucher.agency.whatsappNumber.replace(/\D/g, '');
    const url = phone
      ? `https://wa.me/${phone}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank');
  };

  const handleShareFile = async () => {
    if (!pdfBlob) return;

    const file = new File(
      [pdfBlob],
      `voucher-${sanitize(voucher.customerName)}.pdf`,
      { type: 'application/pdf' }
    );

    if (
      typeof navigator !== 'undefined' &&
      'canShare' in navigator &&
      (navigator as Navigator & { canShare?: (data: ShareData) => boolean }).canShare?.({
        files: [file],
      })
    ) {
      try {
        await navigator.share({
          files: [file],
          title: 'Voucher de Passeio',
          text: buildMessage(),
        });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    handleShareText();
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleShareFile}
        className="w-full bg-whatsapp hover:bg-whatsapp-dark text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2.5 shadow-medium hover:shadow-large active:scale-[0.98] transition-all"
      >
        <WhatsAppIcon />
        <span>Enviar pelo WhatsApp</span>
      </button>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
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

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
