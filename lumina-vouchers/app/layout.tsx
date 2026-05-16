import type { Metadata, Viewport } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lumina Vouchers — Vouchers em segundos',
  description:
    'Crie vouchers de passeios profissionais em segundos e envie pelo WhatsApp. Sem cadastro, sem cartão, 100% grátis.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lumina Vouchers',
  },
  openGraph: {
    title: 'Lumina Vouchers',
    description: 'Crie vouchers de passeios em segundos e envie pelo WhatsApp',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563EB',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
