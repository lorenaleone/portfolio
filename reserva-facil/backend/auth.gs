// ============================================================
// auth.gs — Autenticação por token simples
// ============================================================

/**
 * Valida agenciaId + token e retorna dados da agência se válido.
 * @param {string} agenciaId
 * @param {string} token
 * @returns {{ valid: boolean, agencia?: object, error?: string }}
 */
function validateToken(agenciaId, token) {
  if (!agenciaId || !token) {
    return { valid: false, error: 'agenciaId e token são obrigatórios' };
  }

  try {
    const sheet = getMasterSheet().getSheetByName(CONFIG.SHEET_NAMES.AGENCIAS);
    const data = sheet.getDataRange().getValues();
    const c = CONFIG.MASTER_COLS;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const idMatch = String(row[c.AGENCIA_ID]).trim() === String(agenciaId).trim();
      const tokenMatch = String(row[c.TOKEN]).trim() === String(token).trim();
      const isAtivo = row[c.ATIVO] === true || row[c.ATIVO] === 'TRUE' || row[c.ATIVO] === 'true';

      if (idMatch && tokenMatch) {
        if (!isAtivo) {
          return { valid: false, error: 'Agência inativa. Entre em contato com o suporte.' };
        }
        return {
          valid: true,
          agencia: {
            id: row[c.AGENCIA_ID],
            sheetId: row[c.SHEET_ID],
            nome: row[c.NOME],
            plano: row[c.PLANO],
            email: row[c.EMAIL],
            logoUrl: row[c.LOGO_URL],
            corPrimaria: row[c.COR_PRIMARIA],
            corSecundaria: row[c.COR_SECUNDARIA]
          }
        };
      }
    }

    return { valid: false, error: 'Credenciais inválidas' };
  } catch (e) {
    logError('validateToken', e.message);
    return { valid: false, error: 'Erro interno de autenticação' };
  }
}

/**
 * Gera um token aleatório seguro.
 * @returns {string}
 */
function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < CONFIG.TOKEN_LENGTH; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Gera um agenciaId único baseado no nome da agência.
 * @param {string} nomeAgencia
 * @returns {string}
 */
function generateAgenciaId(nomeAgencia) {
  const clean = nomeAgencia
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 12);
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${clean}_${suffix}`;
}
