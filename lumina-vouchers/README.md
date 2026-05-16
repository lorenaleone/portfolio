# ✨ Lumina Vouchers

Gerador de vouchers de passeios em segundos. Sem cadastro, sem cartão, 100% grátis.

Pensado para agências de turismo pequenas que vendem pelo WhatsApp e precisam de vouchers profissionais sem complicação.

## ⚡ Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** (mobile-first)
- **pdf-lib** (geração client-side)
- **localStorage** (persistência)

Zero backend. Tudo roda no navegador.

## 🚀 Setup local

```bash
cd lumina-vouchers
npm install
npm run dev
```

Abra `http://localhost:3000`.

## 📦 Deploy

### Vercel (recomendado)

```bash
npx vercel
```

Ou conecte o repositório em [vercel.com/new](https://vercel.com/new).

### Outras plataformas

Funciona em qualquer host estático com suporte a Next.js:
- Netlify
- Render
- Cloudflare Pages
- Railway

## 🎯 Como funciona

```
1. Usuário abre o app
   ↓
2. Configura agência (1x, opcional) — nome, WhatsApp, cor, logo
   ↓
3. Preenche formulário — cliente, destino, data
   ↓
4. PDF é gerado no navegador (sem servidor)
   ↓
5. Compartilha pelo WhatsApp ou baixa o PDF
```

**Tempo total: < 30 segundos.**

## 📁 Estrutura

```
lumina-vouchers/
├── app/
│   ├── layout.tsx          Layout raiz (fontes, metadata)
│   ├── page.tsx            Página principal
│   └── globals.css         Estilos globais
│
├── components/
│   ├── Welcome.tsx         Tela inicial (primeira visita)
│   ├── ConfigForm.tsx      Modal de configuração da agência
│   ├── VoucherForm.tsx     Formulário de voucher
│   ├── VoucherPreview.tsx  Preview + ações do PDF
│   └── WhatsAppShare.tsx   Botão WhatsApp com mensagem
│
├── hooks/
│   └── useAgencyConfig.ts  Hook de config da agência
│
├── lib/
│   ├── types.ts            Tipos TypeScript
│   ├── storage.ts          Wrapper de localStorage
│   └── pdf-generator.ts    Lógica de geração do PDF
│
└── public/                 Assets estáticos
```

## ✅ O que tem

- ✓ Mobile-first (otimizado para celular)
- ✓ Funciona offline depois do primeiro carregamento
- ✓ Compartilhamento via WhatsApp (texto + arquivo)
- ✓ Personalização: nome, logo, cor, rodapé
- ✓ PDF profissional com branding
- ✓ Histórico local (últimos 20 vouchers)
- ✓ Web Share API quando disponível
- ✓ Acessibilidade básica

## ❌ O que NÃO tem (por design)

- Login / cadastro
- Banco de dados
- Painel admin
- Cobrança
- Multi-tenant
- Integrações externas

Tudo isso é overengineering para o MVP. Se precisar, adicione depois.

## 🎨 Design

- Cores: brand azul `#2563EB` + WhatsApp verde `#25D366`
- Fontes: Inter (Google Fonts)
- Animações suaves (slide-up, fade-in, scale-in)
- Bordas arredondadas (2xl/3xl)
- Sombras suaves em camadas

## 🔧 Customização

### Trocar a cor padrão

Em `lib/types.ts`:

```ts
export const DEFAULT_AGENCY_CONFIG: AgencyConfig = {
  brandColor: '#10B981', // ← muda aqui
  // ...
};
```

### Mudar o template do PDF

Edite `lib/pdf-generator.ts`. As funções `drawHeader`, `drawCustomerSection`, etc são modulares.

### Adicionar campo no voucher

1. Adicione em `VoucherData` (`lib/types.ts`)
2. Adicione o input em `VoucherForm.tsx`
3. Adicione no PDF em `pdf-generator.ts`
4. Adicione na mensagem WhatsApp em `WhatsAppShare.tsx`

## 📱 Modo PWA (opcional)

Para instalar como app no celular, adicione um `manifest.json` em `public/`:

```json
{
  "name": "Lumina Vouchers",
  "short_name": "Lumina",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#2563EB",
  "theme_color": "#2563EB"
}
```

E linke no `layout.tsx`:

```tsx
<link rel="manifest" href="/manifest.json" />
```

## 📝 Licença

MIT
