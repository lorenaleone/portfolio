# Reserva Fácil — Documentação da API

Todos os endpoints são chamados via `POST` para a URL do Web App do Apps Script.

## Base URL

```
POST https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
Content-Type: application/json
```

---

## Formato padrão de resposta

```json
{ "success": true,  ... }
{ "success": false, "error": "mensagem descritiva" }
```

---

## Endpoints

### `ping` — Health check

**Request**
```json
{ "action": "ping" }
```
**Response**
```json
{ "success": true, "message": "Reserva Fácil API v1.0", "timestamp": "2026-01-01T12:00:00.000Z" }
```

---

### `setupAgencia` — Cria nova agência

**Request**
```json
{
  "action": "setupAgencia",
  "nome":           "Agência Paraíso",     // obrigatório
  "email":          "contato@paraiso.com", // obrigatório
  "telefone":       "(11) 98765-4321",     // opcional
  "endereco":       "São Paulo, SP",       // opcional
  "website":        "https://paraiso.com", // opcional
  "corPrimaria":    "#0D9488",             // opcional (padrão: #2563EB)
  "corSecundaria":  "#0F766E",             // opcional (padrão: #1E40AF)
  "logoUrl":        "https://...",         // opcional
  "passeios":       "Trilha\nBarco\nCity"  // opcional — 1 por linha
}
```
**Response**
```json
{
  "success":   true,
  "agenciaId": "agenciaparaiso_ab12",
  "token":     "xK9mPqR3...",
  "sheetId":   "1BxiMVs0...",
  "mensagem":  "Agência configurada! Credenciais enviadas para contato@paraiso.com"
}
```

---

### `listarPasseios` — Lista passeios ativos (também valida credenciais)

**Request**
```json
{
  "action":    "listarPasseios",
  "agenciaId": "agenciaparaiso_ab12",
  "token":     "xK9mPqR3..."
}
```
**Response**
```json
{
  "success": true,
  "agencia": { "nome": "Agência Paraíso" },
  "passeios": [
    {
      "id":       1,
      "nome":     "Trilha da Cachoeira",
      "descricao": "4h de trilha com guia",
      "preco":    150,
      "duracao":  "4 horas",
      "inclusos": "Transporte, água, lanche"
    }
  ]
}
```

---

### `gerarVoucher` — Gera voucher em PDF

**Request**
```json
{
  "action":        "gerarVoucher",
  "agenciaId":     "agenciaparaiso_ab12",
  "token":         "xK9mPqR3...",
  "passeioId":     1,                   // obrigatório
  "clienteNome":   "Maria Silva",       // obrigatório
  "data":          "2026-03-15",        // obrigatório (YYYY-MM-DD)
  "acompanhantes": 2,                   // opcional (padrão: 0)
  "total":         450.00               // opcional (calculado auto se omitido)
}
```
**Response**
```json
{
  "success": true,
  "voucher": {
    "numero": 5,
    "pdfBase64": "JVBERi0x...",
    "dados": {
      "passeioNome":   "Trilha da Cachoeira",
      "clienteNome":   "Maria Silva",
      "data":          "2026-03-15",
      "acompanhantes": 2,
      "total":         450
    }
  }
}
```

O campo `pdfBase64` é o PDF codificado em Base64. Para fazer download no browser:
```js
const bytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
const blob  = new Blob([bytes], { type: 'application/pdf' });
const url   = URL.createObjectURL(blob);
```

---

### `uploadLogo` — Upload do logo da agência

**Request**
```json
{
  "action":      "uploadLogo",
  "agenciaId":   "agenciaparaiso_ab12",
  "token":       "xK9mPqR3...",
  "imageBase64": "/9j/4AAQ...",
  "mimeType":    "image/png"
}
```
**Response**
```json
{
  "success": true,
  "logoUrl": "https://drive.google.com/uc?id=1abc..."
}
```

---

## Códigos de erro comuns

| Erro | Causa |
|------|-------|
| `Credenciais inválidas` | agenciaId ou token incorreto |
| `Agência inativa` | Conta desativada no Sheet Master |
| `Passeio não encontrado` | passeioId não existe ou está inativo |
| `Campos obrigatórios ausentes: ...` | Faltam campos na requisição |
| `Formato de data inválido` | Use YYYY-MM-DD |
| `Já existe uma agência com este email` | Email duplicado no setup |
