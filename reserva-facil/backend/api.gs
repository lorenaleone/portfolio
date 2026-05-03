// ============================================================
// api.gs — Roteador REST principal (doPost / doGet)
// ============================================================

function doPost(e) {
  return _handleRequest(e, 'POST');
}

function doGet(e) {
  return _handleRequest(e, 'GET');
}

// ── Core handler ──────────────────────────────────────────────

function _handleRequest(e, method) {
  try {
    let action, body;

    if (method === 'POST') {
      const raw = e.postData ? e.postData.contents : '{}';
      body = _safeParse(raw);
      action = body.action || (e.parameter && e.parameter.action);
    } else {
      body = e.parameter || {};
      action = body.action;
    }

    if (!action) {
      return _response({ success: false, error: 'Parâmetro "action" é obrigatório' }, 400);
    }

    const result = _route(action, body);
    return _response(result);
  } catch (err) {
    logError('_handleRequest', err.message);
    return _response({ success: false, error: 'Erro interno: ' + err.message }, 500);
  }
}

// ── Roteador ──────────────────────────────────────────────────

function _route(action, data) {
  switch (action) {

    // ── Health ────────────────────────────────────────────────
    case 'ping':
      return { success: true, message: 'Reserva Fácil API v1.0', timestamp: new Date().toISOString() };

    // ── Setup de nova agência (admin) ─────────────────────────
    case 'setupAgencia':
      return setupAgencia(data);

    // ── Autenticação + Passeios ───────────────────────────────
    case 'listarPasseios':
      return listarPasseios(data.agenciaId, data.token);

    // ── Geração de voucher ────────────────────────────────────
    case 'gerarVoucher':
      return _gerarVoucher(data);

    // ── Upload de logo ────────────────────────────────────────
    case 'uploadLogo':
      return uploadLogoAgencia(data.agenciaId, data.token, data.imageBase64, data.mimeType);

    default:
      return { success: false, error: 'Action desconhecida: ' + action };
  }
}

// ── Handler: gerarVoucher ─────────────────────────────────────

function _gerarVoucher(data) {
  // 1. Autenticação
  const auth = validateToken(data.agenciaId, data.token);
  if (!auth.valid) return { success: false, error: auth.error };

  // 2. Validação de campos
  const missing = ['passeioId', 'clienteNome', 'data'].filter(f => !data[f]);
  if (missing.length > 0) {
    return { success: false, error: 'Campos obrigatórios ausentes: ' + missing.join(', ') };
  }

  // 3. Valida formato de data (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.data)) {
    return { success: false, error: 'Formato de data inválido. Use YYYY-MM-DD' };
  }

  try {
    // 4. Busca passeio
    const passeios = getPasseios(auth.agencia.sheetId);
    const passeio = passeios.find(p => String(p.id) === String(data.passeioId));
    if (!passeio) return { success: false, error: 'Passeio não encontrado: ' + data.passeioId };

    // 5. Busca config da agência (cores, logo, contato)
    const config = getConfigAgencia(auth.agencia.sheetId);

    // 6. Calcula total
    const acompanhantes = parseInt(data.acompanhantes) || 0;
    const total = data.total || (passeio.preco ? passeio.preco * (1 + acompanhantes) : 0);

    // 7. Número sequencial do voucher
    const numero = getProximoNumeroVoucher(auth.agencia.sheetId);

    // 8. Monta payload do voucher
    const voucherData = {
      numero,
      passeioId:    data.passeioId,
      passeioNome:  passeio.nome,
      descricao:    passeio.descricao,
      inclusos:     passeio.inclusos,
      clienteNome:  String(data.clienteNome).trim(),
      data:         data.data,
      acompanhantes,
      total,
      geradoPor:    'app'
    };

    // 9. Persiste no Sheet
    salvarVoucher(auth.agencia.sheetId, voucherData);

    // 10. Gera PDF (base64)
    const pdfBase64 = gerarVoucherPDF(voucherData, config);

    return {
      success: true,
      voucher: {
        numero,
        pdfBase64,
        dados: {
          passeioNome:  voucherData.passeioNome,
          clienteNome:  voucherData.clienteNome,
          data:         voucherData.data,
          acompanhantes: voucherData.acompanhantes,
          total:        voucherData.total
        }
      }
    };
  } catch (e) {
    logError('_gerarVoucher', e.message);
    return { success: false, error: 'Erro ao gerar voucher: ' + e.message };
  }
}

// ── Helpers ───────────────────────────────────────────────────

function _safeParse(str) {
  try { return JSON.parse(str); } catch (_) { return {}; }
}

function _response(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
