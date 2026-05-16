# Deploy Lumina Vouchers

## Pré-requisitos

- Conta GitHub
- Conta Vercel (free)
- Conta Asaas (free)

---

## Step 1: Configurar Asaas API

1. Acesse [asaas.com](https://www.asaas.com) e crie conta grátis
2. Vá em **Configurações → Integrações API**
3. Copie sua **API Key**
4. Guarde essa chave

---

## Step 2: Deploy no Vercel

### Opção A: Via GitHub (recomendado)

1. Faça push do código para GitHub:
   ```bash
   git push origin main
   ```

2. Acesse [vercel.com/new](https://vercel.com/new)

3. Selecione seu repositório do GitHub

4. Na seção **Root Directory**, coloque: `lumina-vouchers`

5. Em **Environment Variables**, adicione:
   - Key: `ASAAS_API_KEY`
   - Value: `[sua chave do Asaas]`

6. Clique **Deploy**

7. Copie a URL do seu deployment (ex: `https://lumina-vouchers.vercel.app`)

### Opção B: Local → Vercel CLI

```bash
cd lumina-vouchers
npm install -g vercel
vercel
```

---

## Step 3: Teste o deploy

1. Abra sua URL do Vercel
2. Configure uma agência (nome + WhatsApp)
3. Crie um voucher de teste
4. Verifique se gera o PDF

---

## Step 4: Começar a vender

### Landing Page
Crie uma página simples:

```
Lumina Vouchers — Vouchers em 30 segundos

[imagem do app]

✨ Crie vouchers turísticos profissionais
💬 Compartilhe direto pelo WhatsApp
🎨 Personalize com sua marca
💳 Apenas R$ 29/mês

[Botão] Comece grátis →
```

Hospede em Vercel também:
```bash
# No repo raiz
mkdir lumina-landing
# Crie index.html
vercel
```

### Divulgar

1. **WhatsApp**: Envie para grupos de agências de turismo
2. **LinkedIn**: Poste mostrando o antes/depois
3. **Reddit**: r/empreendedorismo, r/Brasil
4. **Facebook**: Grupos de turismo e viagens
5. **Google Ads**: Campanhas pequenas (R$ 100-200)

---

## Troubleshooting

### "ASAAS_API_KEY não configurada"

```bash
# Verifique no Vercel:
# Settings → Environment Variables
# Garanta que ASAAS_API_KEY está lá
```

### Pagamento não processa

- Confirme que a API Key é válida
- Teste em staging: `npm run dev`
- Veja os logs no Vercel Dashboard

### PDF não gera

- Abra DevTools (F12) → Console
- Procure por erros
- Reporte para suporte Asaas

---

## Monitorar Vendas

Vercel dashboard mostra:
- Visitas
- Performance
- Erros

Para analytics mais detalhado, integre Google Analytics (gratuito):

```bash
# .env
NEXT_PUBLIC_GA_ID=G_XXXXXXXXXX
```

---

## Próximas Features

1. **White-label** (domínio próprio) → +R$ 50/mês
2. **Integração Sheets** (pré-carregar clientes)
3. **App Mobile** (React Native)
4. **Marketplace de templates**

---

## Suporte

- Docs: veja `README.md`
- Email: [seu email]
- WhatsApp: [seu número]

Sucesso! 🚀
