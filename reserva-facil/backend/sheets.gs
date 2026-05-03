// ============================================================
// sheets.gs — Operações com Google Sheets
// ============================================================

// ── Acesso aos Sheets ────────────────────────────────────────

function getMasterSheet() {
  return SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
}

function getClientSheet(sheetId) {
  try {
    return SpreadsheetApp.openById(sheetId);
  } catch (e) {
    throw new Error('Sheet do cliente não encontrado. SheetId: ' + sheetId);
  }
}

// ── Dados da Agência ─────────────────────────────────────────

function getAgenciaData(agenciaId) {
  const sheet = getMasterSheet().getSheetByName(CONFIG.SHEET_NAMES.AGENCIAS);
  const data = sheet.getDataRange().getValues();
  const c = CONFIG.MASTER_COLS;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][c.AGENCIA_ID]).trim() === String(agenciaId).trim()) {
      return {
        agenciaId:      data[i][c.AGENCIA_ID],
        sheetId:        data[i][c.SHEET_ID],
        nome:           data[i][c.NOME],
        token:          data[i][c.TOKEN],
        ativo:          data[i][c.ATIVO],
        plano:          data[i][c.PLANO],
        email:          data[i][c.EMAIL],
        logoUrl:        data[i][c.LOGO_URL],
        corPrimaria:    data[i][c.COR_PRIMARIA],
        corSecundaria:  data[i][c.COR_SECUNDARIA],
        criadoEm:       data[i][c.CRIADO_EM]
      };
    }
  }
  return null;
}

function registrarAgenciaMaster(agenciaData, sheetId) {
  const sheet = getMasterSheet().getSheetByName(CONFIG.SHEET_NAMES.AGENCIAS);
  sheet.appendRow([
    agenciaData.agenciaId,
    sheetId,
    agenciaData.nome,
    agenciaData.token,
    true,
    agenciaData.plano || CONFIG.PLANOS.BASICO,
    agenciaData.email || '',
    agenciaData.logoUrl || '',
    agenciaData.corPrimaria || '#2563EB',
    agenciaData.corSecundaria || '#1E40AF',
    new Date().toISOString()
  ]);
}

function updateAgenciaMaster(agenciaId, campo, valor) {
  const sheet = getMasterSheet().getSheetByName(CONFIG.SHEET_NAMES.AGENCIAS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const colIndex = headers.indexOf(campo);
  if (colIndex === -1) return;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(agenciaId).trim()) {
      sheet.getRange(i + 1, colIndex + 1).setValue(valor);
      return;
    }
  }
}

// ── Criação do Sheet do Cliente ──────────────────────────────

function createClientSheet(agenciaData) {
  const ss = SpreadsheetApp.create('ReservaFacil - ' + agenciaData.nome);

  // Aba: passeios
  const passeiosSheet = ss.getSheets()[0];
  passeiosSheet.setName(CONFIG.CLIENT_SHEET_NAMES.PASSEIOS);
  passeiosSheet.appendRow(['id', 'nome', 'descricao', 'preco', 'duracao', 'inclusos', 'ativo', 'criadoEm']);
  passeiosSheet.setFrozenRows(1);
  _formatarCabecalho(passeiosSheet, agenciaData.corPrimaria);

  // Aba: vouchers
  const vouchersSheet = ss.insertSheet(CONFIG.CLIENT_SHEET_NAMES.VOUCHERS);
  vouchersSheet.appendRow(['numero', 'passeioId', 'passeioNome', 'clienteNome', 'data', 'acompanhantes', 'total', 'geradoEm', 'geradoPor']);
  vouchersSheet.setFrozenRows(1);
  _formatarCabecalho(vouchersSheet, agenciaData.corPrimaria);

  // Aba: config
  const configSheet = ss.insertSheet(CONFIG.CLIENT_SHEET_NAMES.CONFIG);
  configSheet.appendRow(['chave', 'valor']);
  const configRows = [
    ['nomeAgencia',    agenciaData.nome],
    ['logoUrl',        agenciaData.logoUrl || ''],
    ['corPrimaria',    agenciaData.corPrimaria || '#2563EB'],
    ['corSecundaria',  agenciaData.corSecundaria || '#1E40AF'],
    ['email',          agenciaData.email || ''],
    ['telefone',       agenciaData.telefone || ''],
    ['endereco',       agenciaData.endereco || ''],
    ['website',        agenciaData.website || '']
  ];
  configSheet.getRange(2, 1, configRows.length, 2).setValues(configRows);
  configSheet.setFrozenRows(1);

  // Popula passeios iniciais
  if (agenciaData.passeios && agenciaData.passeios.length > 0) {
    const rows = agenciaData.passeios.map((p, i) => [
      i + 1,
      p.nome,
      p.descricao || '',
      p.preco || 0,
      p.duracao || '',
      p.inclusos || '',
      true,
      new Date().toISOString()
    ]);
    passeiosSheet.getRange(2, 1, rows.length, 8).setValues(rows);
  }

  return ss.getId();
}

function _formatarCabecalho(sheet, corPrimaria) {
  const cor = corPrimaria || '#2563EB';
  const cabecalho = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  cabecalho.setBackground(cor).setFontColor('#FFFFFF').setFontWeight('bold');
}

// ── Passeios ─────────────────────────────────────────────────

function getPasseios(sheetId) {
  const ss = getClientSheet(sheetId);
  const sheet = ss.getSheetByName(CONFIG.CLIENT_SHEET_NAMES.PASSEIOS);
  const data = sheet.getDataRange().getValues();
  const c = CONFIG.PASSEIO_COLS;

  return data.slice(1)
    .filter(row => row[c.ATIVO] === true || row[c.ATIVO] === 'TRUE' || row[c.ATIVO] === 'true')
    .map(row => ({
      id:       row[c.ID],
      nome:     row[c.NOME],
      descricao: row[c.DESCRICAO],
      preco:    row[c.PRECO],
      duracao:  row[c.DURACAO],
      inclusos: row[c.INCLUSOS]
    }));
}

// ── Config da Agência ────────────────────────────────────────

function getConfigAgencia(sheetId) {
  const ss = getClientSheet(sheetId);
  const sheet = ss.getSheetByName(CONFIG.CLIENT_SHEET_NAMES.CONFIG);
  const data = sheet.getDataRange().getValues();

  const config = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) config[data[i][0]] = data[i][1];
  }
  return config;
}

function updateConfigAgencia(sheetId, campo, valor) {
  const ss = getClientSheet(sheetId);
  const sheet = ss.getSheetByName(CONFIG.CLIENT_SHEET_NAMES.CONFIG);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === campo) {
      sheet.getRange(i + 1, 2).setValue(valor);
      return;
    }
  }
  // Campo não existe — adiciona no final
  sheet.appendRow([campo, valor]);
}

// ── Vouchers ─────────────────────────────────────────────────

function getProximoNumeroVoucher(sheetId) {
  const ss = getClientSheet(sheetId);
  const sheet = ss.getSheetByName(CONFIG.CLIENT_SHEET_NAMES.VOUCHERS);
  // lastRow inclui o cabeçalho, então (lastRow - 1) vouchers existem → próximo = lastRow
  return sheet.getLastRow();
}

function salvarVoucher(sheetId, voucherData) {
  const ss = getClientSheet(sheetId);
  const sheet = ss.getSheetByName(CONFIG.CLIENT_SHEET_NAMES.VOUCHERS);
  sheet.appendRow([
    voucherData.numero,
    voucherData.passeioId,
    voucherData.passeioNome,
    voucherData.clienteNome,
    voucherData.data,
    voucherData.acompanhantes,
    voucherData.total,
    new Date().toISOString(),
    voucherData.geradoPor || 'app'
  ]);
}

// ── Logs ──────────────────────────────────────────────────────

function logError(funcao, mensagem) {
  try {
    const ss = getMasterSheet();
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.LOGS);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEET_NAMES.LOGS);
      sheet.appendRow(['timestamp', 'funcao', 'mensagem']);
    }
    sheet.appendRow([new Date().toISOString(), funcao, mensagem]);
  } catch (_) {
    // Falha silenciosa para não quebrar o fluxo principal
  }
}
