// ============================================================
// Code.gs — Entry point do Apps Script — Reserva Fácil v1.0
// ============================================================
//
// ORDEM DE CARREGAMENTO (Apps Script carrega em ordem alfabética):
//   1. Code.gs
//   2. agencia.gs
//   3. api.gs       ← define doPost() e doGet()
//   4. auth.gs
//   5. config.gs
//   6. sheets.gs
//   7. voucher.gs
//
// DEPLOY:
//   Apps Script → Implantar → Novo Implante → Web App
//   Execute as: Me | Who has access: Anyone
// ============================================================

/**
 * Inicializa o Sheet Master com as abas e cabeçalhos necessários.
 * Execute UMA VEZ manualmente antes do primeiro deploy.
 */
function inicializarSistemaMaster() {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);

  // Aba agencias
  let agencias = ss.getSheetByName(CONFIG.SHEET_NAMES.AGENCIAS);
  if (!agencias) {
    agencias = ss.insertSheet(CONFIG.SHEET_NAMES.AGENCIAS);
    agencias.appendRow([
      'agenciaId', 'sheetId', 'nomeAgencia', 'token', 'ativo', 'plano',
      'email', 'logoUrl', 'corPrimaria', 'corSecundaria', 'criadoEm'
    ]);
    agencias.setFrozenRows(1);
    const header = agencias.getRange(1, 1, 1, 11);
    header.setBackground('#1E40AF').setFontColor('#FFFFFF').setFontWeight('bold');
    Logger.log('✅ Aba "agencias" criada.');
  } else {
    Logger.log('ℹ️  Aba "agencias" já existe.');
  }

  // Aba logs
  let logs = ss.getSheetByName(CONFIG.SHEET_NAMES.LOGS);
  if (!logs) {
    logs = ss.insertSheet(CONFIG.SHEET_NAMES.LOGS);
    logs.appendRow(['timestamp', 'funcao', 'mensagem']);
    logs.setFrozenRows(1);
    Logger.log('✅ Aba "logs" criada.');
  } else {
    Logger.log('ℹ️  Aba "logs" já existe.');
  }

  Logger.log('🚀 Sistema Reserva Fácil inicializado com sucesso!');
}

/**
 * Teste rápido de sanidade — execute no editor do Apps Script.
 */
function testarAPI() {
  // Simula um ping
  const pingResult = _route('ping', {});
  Logger.log('Ping: ' + JSON.stringify(pingResult));

  // Simula setup de agência de teste
  const setupResult = setupAgencia({
    nome:           'Agência Teste',
    email:          'teste@exemplo.com',
    corPrimaria:    '#0D9488',
    corSecundaria:  '#0F766E',
    telefone:       '(11) 98765-4321',
    passeios:       'Trilha da Cachoeira\nCidade Histórica\nPasseio de Barco'
  });
  Logger.log('Setup: ' + JSON.stringify(setupResult));
}
