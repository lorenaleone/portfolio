// ============================================================
// agencia.gs — Gerenciamento de agências (setup, logo, passeios)
// ============================================================

/**
 * Configura uma nova agência:
 * cria o Sheet, registra no Master e envia credenciais por email.
 */
function setupAgencia(data) {
  // Validações obrigatórias
  if (!data.nome || String(data.nome).trim() === '') {
    return { success: false, error: 'Nome da agência é obrigatório' };
  }
  if (!data.email || !_validarEmail(data.email)) {
    return { success: false, error: 'Email válido é obrigatório' };
  }

  // Verifica se já existe agência com o mesmo email
  const duplicado = _verificarEmailDuplicado(data.email);
  if (duplicado) {
    return { success: false, error: 'Já existe uma agência cadastrada com este email' };
  }

  const agenciaId = generateAgenciaId(data.nome);
  const token = generateToken();

  // Normaliza passeios (aceita string multiline ou array de objetos)
  const passeios = _normalizarPasseios(data.passeios);

  const agenciaData = {
    agenciaId,
    nome:          data.nome.trim(),
    token,
    email:         data.email.trim(),
    plano:         data.plano || CONFIG.PLANOS.BASICO,
    logoUrl:       data.logoUrl || '',
    corPrimaria:   data.corPrimaria || '#2563EB',
    corSecundaria: data.corSecundaria || '#1E40AF',
    telefone:      data.telefone || '',
    endereco:      data.endereco || '',
    website:       data.website || '',
    passeios
  };

  try {
    const sheetId = createClientSheet(agenciaData);
    registrarAgenciaMaster(agenciaData, sheetId);
    _enviarEmailCredenciais(agenciaData, sheetId);

    return {
      success: true,
      agenciaId,
      token,
      sheetId,
      mensagem: 'Agência configurada! Credenciais enviadas para ' + agenciaData.email
    };
  } catch (e) {
    logError('setupAgencia', e.message);
    return { success: false, error: 'Erro ao configurar agência: ' + e.message };
  }
}

/**
 * Lista passeios de uma agência autenticada.
 */
function listarPasseios(agenciaId, token) {
  const auth = validateToken(agenciaId, token);
  if (!auth.valid) return { success: false, error: auth.error };

  try {
    const passeios = getPasseios(auth.agencia.sheetId);
    return { success: true, passeios, agencia: { nome: auth.agencia.nome } };
  } catch (e) {
    logError('listarPasseios', e.message);
    return { success: false, error: 'Erro ao listar passeios' };
  }
}

/**
 * Faz upload do logo da agência para o Drive e atualiza as configs.
 */
function uploadLogoAgencia(agenciaId, token, imageBase64, mimeType) {
  const auth = validateToken(agenciaId, token);
  if (!auth.valid) return { success: false, error: auth.error };

  if (!imageBase64 || !mimeType) {
    return { success: false, error: 'imageBase64 e mimeType são obrigatórios' };
  }

  const tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!tiposPermitidos.includes(mimeType)) {
    return { success: false, error: 'Tipo de imagem não suportado. Use PNG, JPG ou WebP.' };
  }

  try {
    const bytes = Utilities.base64Decode(imageBase64);
    const blob = Utilities.newBlob(bytes, mimeType, 'logo_' + agenciaId);
    const folder = _getOrCreateLogoFolder();

    // Remove logo anterior
    const existing = folder.getFilesByName('logo_' + agenciaId);
    while (existing.hasNext()) existing.next().setTrashed(true);

    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const logoUrl = 'https://drive.google.com/uc?id=' + file.getId();

    // Atualiza nos dois lugares
    updateConfigAgencia(auth.agencia.sheetId, 'logoUrl', logoUrl);
    updateAgenciaMaster(agenciaId, 'logoUrl', logoUrl);

    return { success: true, logoUrl };
  } catch (e) {
    logError('uploadLogoAgencia', e.message);
    return { success: false, error: 'Erro ao fazer upload do logo' };
  }
}

// ── Helpers internos ──────────────────────────────────────────

function _enviarEmailCredenciais(agenciaData, sheetId) {
  const appUrl = CONFIG.APP_URL || 'https://seu-app-url.com';

  const corpo = [
    'Olá, ' + agenciaData.nome + '!',
    '',
    'Seu sistema Reserva Fácil está pronto. Acesse com as credenciais abaixo:',
    '',
    '📋 CREDENCIAIS DE ACESSO',
    '• ID da Agência: ' + agenciaData.agenciaId,
    '• Token: ' + agenciaData.token,
    '',
    '🔗 Acesse: ' + appUrl,
    '',
    '⚠️ IMPORTANTE',
    '- Guarde estas credenciais em local seguro.',
    '- Não compartilhe seu token.',
    '- Em caso de perda, entre em contato para regenerar.',
    '',
    'Precisa de ajuda? Responda este email.',
    '',
    'Equipe Reserva Fácil'
  ].join('\n');

  try {
    MailApp.sendEmail({
      to: agenciaData.email,
      subject: 'Reserva Fácil — Credenciais de Acesso — ' + agenciaData.nome,
      body: corpo
    });
  } catch (e) {
    logError('_enviarEmailCredenciais', e.message);
    // Não lança — o setup continua mesmo se o email falhar
  }
}

function _normalizarPasseios(passeiosInput) {
  if (!passeiosInput) return [];

  // Aceita string com um passeio por linha
  if (typeof passeiosInput === 'string') {
    return passeiosInput
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(nome => ({ nome }));
  }

  // Aceita array de strings ou objetos
  if (Array.isArray(passeiosInput)) {
    return passeiosInput.map(p => (typeof p === 'string' ? { nome: p } : p));
  }

  return [];
}

function _validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function _verificarEmailDuplicado(email) {
  const sheet = getMasterSheet().getSheetByName(CONFIG.SHEET_NAMES.AGENCIAS);
  const data = sheet.getDataRange().getValues();
  const emailCol = CONFIG.MASTER_COLS.EMAIL;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][emailCol]).trim().toLowerCase() === email.trim().toLowerCase()) {
      return true;
    }
  }
  return false;
}

function _getOrCreateLogoFolder() {
  const name = 'ReservaFacil_Logos';
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}
