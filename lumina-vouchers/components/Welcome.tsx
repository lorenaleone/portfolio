'use client';

interface WelcomeProps {
  onStart: () => void;
}

export function Welcome({ onStart }: WelcomeProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-50 via-white to-brand-50">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto w-full">
        <div className="mb-10 animate-scale-in">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl flex items-center justify-center shadow-large mb-6 rotate-3">
            <span className="text-5xl">✨</span>
          </div>
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
            Lumina Vouchers
          </h1>
          <p className="text-center text-gray-600 leading-relaxed">
            Crie vouchers profissionais para seus passeios em segundos.
            Envie pelo WhatsApp direto pro cliente.
          </p>
        </div>

        <div className="w-full space-y-3 mb-10">
          <Feature emoji="⚡" title="Rápido">
            Voucher pronto em menos de 30 segundos
          </Feature>
          <Feature emoji="💬" title="WhatsApp nativo">
            Compartilhe direto pro cliente com 1 toque
          </Feature>
          <Feature emoji="🎨" title="Personalizado">
            Sua marca, suas cores, seu logo
          </Feature>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white py-4 rounded-2xl font-semibold text-base shadow-large active:scale-[0.98] transition-all"
        >
          Começar agora →
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          Sem cadastro · Sem cartão · 100% grátis
        </p>
      </div>
    </div>
  );
}

function Feature({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
        <span className="text-xl">{emoji}</span>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <p className="text-sm text-gray-600">{children}</p>
      </div>
    </div>
  );
}
