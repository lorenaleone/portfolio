# Reserva Fácil — Sistema de Vouchers Turísticos

PWA multi-tenant para agências de turismo gerarem vouchers em PDF via Google Apps Script + Sheets.

## Stack

- **Backend:** Google Apps Script (Web App REST API)
- **Banco:** Google Sheets (Sheet Master + Sheets individuais por cliente)
- **Frontend:** PWA Vanilla JS, HTML5, CSS3 (zero dependências)
- **PDF:** Apps Script DriveApp (HTML → PDF)

## Arquitetura

```
Agência Login (agenciaId + token)
    │
    ▼
Apps Script Web App (api.gs → router)
    │
    ├── validateToken()     ← auth.gs
    ├── getPasseios()       ← sheets.gs → Sheet do cliente
    ├── gerarVoucher()      ← voucher.gs → PDF base64
    └── setupAgencia()      ← agencia.gs → cria Sheet + registra no Master
                                               │
                                               ▼
                                     Sheet Master (agencias, logs)
```

## Estrutura de arquivos

```
reserva-facil/
├── backend/
│   ├── Code.gs      Entry point + setup/teste
│   ├── config.gs    Constantes globais (IDs, nomes de abas, colunas)
│   ├── auth.gs      validateToken, generateToken, generateAgenciaId
│   ├── sheets.gs    CRUD Google Sheets (master e cliente)
│   ├── voucher.gs   Geração HTML → PDF base64
│   ├── agencia.gs   setupAgencia, listarPasseios, uploadLogo
│   └── api.gs       doPost/doGet, router, handler de cada action
│
├── frontend/
│   ├── index.html   5 telas: Login, Voucher, Preview, Wizard, Sucesso
│   ├── app.js       Lógica PWA (navegação, API, wizard, PDF download)
│   ├── styles.css   Dark theme, mobile-first, CSS custom properties
│   ├── manifest.json PWA config
│   └── sw.js        Service Worker (cache-first estáticos, network para API)
│
└── docs/
    ├── API.md        Documentação de todos os endpoints
    └── SETUP.md      Passo-a-passo de deploy do zero
```

## Sheet Master — estrutura

Aba `agencias`:
| agenciaId | sheetId | nomeAgencia | token | ativo | plano | email | logoUrl | corPrimaria | corSecundaria | criadoEm |

Aba `logs`:
| timestamp | funcao | mensagem |

## Sheet do cliente — estrutura

Aba `passeios`: id, nome, descricao, preco, duracao, inclusos, ativo, criadoEm
Aba `vouchers`: numero, passeioId, passeioNome, clienteNome, data, acompanhantes, total, geradoEm, geradoPor
Aba `config`:   chave/valor (nomeAgencia, logoUrl, corPrimaria, corSecundaria, email, telefone, endereco, website)

## Variáveis de configuração

Antes do deploy, substituir em:

- `backend/config.gs` → `MASTER_SHEET_ID` e `APP_URL`
- `frontend/app.js` linha 4 → `API_URL`

## Comandos úteis (no editor Apps Script)

```
inicializarSistemaMaster()  // Cria abas no Sheet Master — executar 1x
testarAPI()                 // Cria agência de teste e imprime credenciais
```

## Fluxo de novo cliente

1. Cliente acessa o frontend → "Configurar Nova Agência"
2. Wizard (4 passos): dados → cores → passeios → revisão
3. `setupAgencia` cria o Sheet, registra no Master, envia credenciais por email
4. Cliente recebe agenciaId + token e faz login imediatamente
