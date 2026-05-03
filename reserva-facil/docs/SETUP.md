# Reserva Fácil — Guia de Deploy

## Pré-requisitos

- Conta Google
- Acesso ao [Google Apps Script](https://script.google.com)
- Hospedagem estática para o frontend (GitHub Pages, Netlify, etc.)

---

## Passo 1 — Criar o Sheet Master

1. Acesse [sheets.google.com](https://sheets.google.com) e crie uma nova planilha chamada **"ReservaFacil Master"**
2. Copie o ID da URL: `https://docs.google.com/spreadsheets/d/**{SEU_ID_AQUI}**/edit`
3. Guarde esse ID

---

## Passo 2 — Configurar o Apps Script

1. Acesse [script.google.com](https://script.google.com) → **Novo projeto**
2. Renomeie o projeto para `ReservaFacil`
3. Crie os seguintes arquivos (Arquivo → Novo script):
   - `config.gs`
   - `auth.gs`
   - `sheets.gs`
   - `voucher.gs`
   - `agencia.gs`
   - `api.gs`
4. Copie o conteúdo de cada arquivo da pasta `backend/` deste repositório
5. Em `config.gs`, substitua `'SEU_SHEET_MASTER_ID_AQUI'` pelo ID copiado no Passo 1

---

## Passo 3 — Inicializar o Sheet Master

1. No editor do Apps Script, selecione a função `inicializarSistemaMaster`
2. Clique em **Executar** (▶️)
3. Autorize as permissões solicitadas (Drive, Sheets, Gmail)
4. Confirme no Sheet Master que as abas `agencias` e `logs` foram criadas

---

## Passo 4 — Fazer o Deploy do Web App

1. No editor do Apps Script, clique em **Implantar → Novo implante**
2. Configure:
   - **Tipo:** Web App
   - **Executar como:** Eu (Me)
   - **Quem tem acesso:** Qualquer pessoa (Anyone)
3. Clique em **Implantar**
4. **Copie a URL do Web App** — ela tem o formato:
   ```
   https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
   ```

---

## Passo 5 — Configurar o Frontend

1. Abra `frontend/app.js`
2. Substitua na linha 4:
   ```js
   const API_URL = 'SUA_URL_DO_WEBAPP_AQUI';
   ```
   pela URL copiada no Passo 4
3. Faça o mesmo em `config.gs`:
   ```js
   APP_URL: 'SUA_URL_DO_WEBAPP_AQUI',
   ```

---

## Passo 6 — Deploy do Frontend

### GitHub Pages (recomendado)

1. Suba a pasta `frontend/` para um repositório GitHub
2. Vá em **Settings → Pages → Deploy from branch → main → /frontend**
3. Acesse `https://{seu-usuario}.github.io/{repositorio}`

### Netlify

1. Arraste a pasta `frontend/` para [app.netlify.com/drop](https://app.netlify.com/drop)
2. URL gerada automaticamente

### Qualquer hospedagem estática

Suba os arquivos via FTP/SFTP:
```
index.html
app.js
styles.css
manifest.json
sw.js
icons/          ← crie ícones 192x192 e 512x512
```

---

## Passo 7 — Ícones PWA (opcional mas recomendado)

Crie a pasta `frontend/icons/` e adicione:
- `icon-192.png` (192×192 px)
- `icon-512.png` (512×512 px)

Ferramenta gratuita: [realfavicongenerator.net](https://realfavicongenerator.net)

---

## Passo 8 — Teste de sanidade

No editor do Apps Script, execute a função `testarAPI()`.
Ela irá:
1. Fazer um ping na API
2. Criar uma **agência de teste** com 3 passeios de exemplo
3. Imprimir as credenciais geradas no log

Depois, acesse o frontend e faça login com as credenciais impressas.

---

## Atualizando o backend

Toda alteração no código do Apps Script **precisa de um novo deploy**:

1. Implantar → Gerenciar implantações → Editar (lápis)
2. Versão → **Nova versão**
3. Implantar → **a URL permanece a mesma**

---

## Variáveis importantes

| Variável | Onde alterar | Descrição |
|----------|-------------|-----------|
| `CONFIG.MASTER_SHEET_ID` | `config.gs` | ID do Sheet Master |
| `CONFIG.APP_URL` | `config.gs` | URL pública do frontend |
| `API_URL` | `app.js` linha 4 | URL do Web App (Apps Script) |
