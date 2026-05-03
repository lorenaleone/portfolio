// ============================================================
// config.gs — Configurações globais do sistema Reserva Fácil
// ============================================================

const CONFIG = {
  // ⚠️ Substitua pelo ID do seu Sheet Master após criá-lo
  MASTER_SHEET_ID: 'SEU_SHEET_MASTER_ID_AQUI',

  // URL pública do Web App após deploy
  APP_URL: 'SUA_URL_DO_WEBAPP_AQUI',

  SHEET_NAMES: {
    AGENCIAS: 'agencias',
    LOGS: 'logs'
  },

  CLIENT_SHEET_NAMES: {
    PASSEIOS: 'passeios',
    VOUCHERS: 'vouchers',
    CONFIG: 'config'
  },

  PLANOS: {
    BASICO: 'basico',
    PRO: 'pro',
    ENTERPRISE: 'enterprise'
  },

  TOKEN_LENGTH: 32,

  // Colunas do Sheet Master (índice 0-based)
  MASTER_COLS: {
    AGENCIA_ID: 0,
    SHEET_ID: 1,
    NOME: 2,
    TOKEN: 3,
    ATIVO: 4,
    PLANO: 5,
    EMAIL: 6,
    LOGO_URL: 7,
    COR_PRIMARIA: 8,
    COR_SECUNDARIA: 9,
    CRIADO_EM: 10
  },

  // Colunas da aba passeios (índice 0-based)
  PASSEIO_COLS: {
    ID: 0,
    NOME: 1,
    DESCRICAO: 2,
    PRECO: 3,
    DURACAO: 4,
    INCLUSOS: 5,
    ATIVO: 6,
    CRIADO_EM: 7
  },

  // Colunas da aba vouchers (índice 0-based)
  VOUCHER_COLS: {
    NUMERO: 0,
    PASSEIO_ID: 1,
    PASSEIO_NOME: 2,
    CLIENTE_NOME: 3,
    DATA: 4,
    ACOMPANHANTES: 5,
    TOTAL: 6,
    GERADO_EM: 7,
    GERADO_POR: 8
  }
};
