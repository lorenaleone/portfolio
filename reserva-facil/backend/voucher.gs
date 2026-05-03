// ============================================================
// voucher.gs — Geração de vouchers em PDF
// ============================================================

/**
 * Gera o PDF do voucher e retorna como base64.
 * @param {object} voucherData - Dados do voucher
 * @param {object} config - Configurações da agência (cores, logo, etc.)
 * @returns {string} PDF em base64
 */
function gerarVoucherPDF(voucherData, config) {
  const html = buildVoucherHTML(voucherData, config);
  const blob = Utilities.newBlob(html, MimeType.HTML, 'voucher_' + voucherData.numero + '.html');

  // Cria arquivo temporário no Drive para converter em PDF
  const tempFile = DriveApp.createFile(blob);
  const pdfBlob = tempFile.getAs(MimeType.PDF);
  tempFile.setTrashed(true);

  return Utilities.base64Encode(pdfBlob.getBytes());
}

/**
 * Monta o HTML do voucher com a identidade visual da agência.
 */
function buildVoucherHTML(voucherData, config) {
  const cor1 = config.corPrimaria || '#2563EB';
  const cor2 = config.corSecundaria || '#1E40AF';
  const logoUrl = config.logoUrl || '';
  const nomeAgencia = config.nomeAgencia || 'Agência de Turismo';
  const numero = String(voucherData.numero).padStart(4, '0');

  const dataFormatada = _formatarData(voucherData.data);
  const valorFormatado = voucherData.total
    ? 'R$ ' + parseFloat(voucherData.total).toFixed(2).replace('.', ',')
    : '';

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" class="logo" alt="Logo">`
    : `<div class="logo-placeholder">${nomeAgencia.charAt(0)}</div>`;

  const inclusosHtml = voucherData.inclusos
    ? `<div class="inclusos"><h3>O que está incluso</h3><p>${voucherData.inclusos}</p></div>`
    : '';

  const descricaoHtml = voucherData.descricao
    ? `<p class="descricao">${voucherData.descricao}</p>`
    : '';

  const valorHtml = valorFormatado
    ? `<div class="info-item"><label>Valor Total</label><span>${valorFormatado}</span></div>`
    : '';

  const contatoHtml = [
    config.email    ? `<span>✉ ${config.email}</span>` : '',
    config.telefone ? `<span>📞 ${config.telefone}</span>` : '',
    config.endereco ? `<span>📍 ${config.endereco}</span>` : ''
  ].filter(Boolean).join('<span class="sep">•</span>');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;background:#f0f2f5;padding:20px;color:#1a1a2e}
  .voucher{max-width:760px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.12)}
  .header{background:linear-gradient(135deg,${cor1},${cor2});color:#fff;padding:28px 32px;display:flex;align-items:center;gap:20px}
  .logo{width:72px;height:72px;object-fit:contain;border-radius:10px;background:#fff;padding:6px}
  .logo-placeholder{width:72px;height:72px;border-radius:10px;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;flex-shrink:0}
  .header-text h1{font-size:22px;font-weight:700;margin-bottom:4px}
  .header-text p{font-size:13px;opacity:.85}
  .badge{display:inline-block;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);padding:3px 12px;border-radius:20px;font-size:12px;margin-top:8px;letter-spacing:.5px}
  .body{padding:28px 32px}
  .section{margin-bottom:24px}
  .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:${cor1};margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid ${cor1}15}
  .passeio-card{background:${cor1}0d;border-left:4px solid ${cor1};padding:16px;border-radius:0 8px 8px 0}
  .passeio-nome{font-size:20px;font-weight:700;color:${cor1}}
  .descricao{font-size:14px;color:#555;margin-top:6px;line-height:1.5}
  .inclusos{margin-top:12px}
  .inclusos h3{font-size:11px;text-transform:uppercase;color:#777;margin-bottom:4px}
  .inclusos p{font-size:14px;color:#333;line-height:1.6}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .info-item label{display:block;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
  .info-item span{font-size:16px;font-weight:600;color:#1a1a2e}
  .status-bar{display:flex;justify-content:space-between;align-items:center;background:#f8f9ff;border-radius:10px;padding:16px 20px}
  .status-label{font-size:11px;color:#888;margin-bottom:2px}
  .status-value{font-size:14px;font-weight:600;color:#333}
  .badge-ok{background:${cor1};color:#fff;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600}
  .footer{background:${cor1};color:#fff;text-align:center;padding:14px 20px;font-size:12px;display:flex;flex-wrap:wrap;justify-content:center;gap:6px;align-items:center}
  .footer .sep{opacity:.4}
  @media print{body{background:#fff;padding:0}.voucher{box-shadow:none;border-radius:0}}
</style>
</head>
<body>
<div class="voucher">
  <div class="header">
    ${logoHtml}
    <div class="header-text">
      <h1>${nomeAgencia}</h1>
      <p>Voucher de Passeio Turístico</p>
      <span class="badge">Nº ${numero}</span>
    </div>
  </div>

  <div class="body">
    <div class="section">
      <div class="section-title">Passeio</div>
      <div class="passeio-card">
        <div class="passeio-nome">${voucherData.passeioNome}</div>
        ${descricaoHtml}
        ${inclusosHtml}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Dados do Cliente</div>
      <div class="info-grid">
        <div class="info-item">
          <label>Nome do Cliente</label>
          <span>${voucherData.clienteNome}</span>
        </div>
        <div class="info-item">
          <label>Data do Passeio</label>
          <span>${dataFormatada}</span>
        </div>
        <div class="info-item">
          <label>Acompanhantes</label>
          <span>${voucherData.acompanhantes || 0} pessoa(s)</span>
        </div>
        ${valorHtml}
      </div>
    </div>

    <div class="status-bar">
      <div>
        <div class="status-label">Gerado em</div>
        <div class="status-value">${_formatarDataHora(new Date())}</div>
      </div>
      <span class="badge-ok">✓ CONFIRMADO</span>
    </div>
  </div>

  <div class="footer">
    ${contatoHtml || nomeAgencia}
  </div>
</div>
</body>
</html>`;
}

// ── Helpers de data ───────────────────────────────────────────

function _formatarData(dataStr) {
  try {
    const d = new Date(dataStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch (_) {
    return dataStr;
  }
}

function _formatarDataHora(date) {
  return date.toLocaleDateString('pt-BR') + ' às ' +
    date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
