// ============================================================
// app.js — Reserva Fácil PWA — Vanilla JS
// ============================================================

// ── Configuração ──────────────────────────────────────────────
const API_URL = 'SUA_URL_DO_WEBAPP_AQUI'; // ⚠️ Substitua após o deploy
const STORAGE_KEY = 'reservafacil_auth';

// ── Estado global ─────────────────────────────────────────────
const state = {
  auth:     null,   // { agenciaId, token, nomeAgencia }
  passeios: [],
  wizard:   { step: 1, data: {} }
};

// ── Elementos DOM ─────────────────────────────────────────────
const $ = id => document.getElementById(id);

// Screens
const screens = {
  login:    $('screen-login'),
  voucher:  $('screen-voucher'),
  preview:  $('screen-preview'),
  wizard:   $('screen-wizard'),
  success:  $('screen-wizard-success')
};

// ── Inicialização ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  restoreSession();
});

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function restoreSession() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      state.auth = JSON.parse(saved);
      showScreen('voucher');
      loadPasseios();
      return;
    } catch (_) {}
  }
  showScreen('login');
}

// ── Navegação entre telas ────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s && s.classList.remove('active'));
  if (screens[name]) screens[name].classList.add('active');
}

// ── Login ─────────────────────────────────────────────────────
$('form-login').addEventListener('submit', async e => {
  e.preventDefault();
  const agenciaId = $('input-agencia-id').value.trim();
  const token     = $('input-token').value.trim();

  if (!agenciaId || !token) return showToast('Preencha todos os campos', 'error');

  setBtnLoading($('btn-login'), true);

  // Usamos listarPasseios para validar as credenciais e já buscar os passeios
  const res = await api('listarPasseios', { agenciaId, token });

  setBtnLoading($('btn-login'), false);

  if (!res.success) {
    showToast(res.error || 'Credenciais inválidas', 'error');
    return;
  }

  state.auth = { agenciaId, token, nomeAgencia: res.agencia?.nome || agenciaId };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.auth));
  state.passeios = res.passeios;

  showScreen('voucher');
  populatePasseios();
  updateAgencyHeader();
  showToast('Bem-vindo(a)! ' + state.auth.nomeAgencia, 'success');
});

// ── Voucher ───────────────────────────────────────────────────
async function loadPasseios() {
  if (!state.auth) return;
  const res = await api('listarPasseios', state.auth);
  if (res.success) {
    state.passeios = res.passeios;
    populatePasseios();
    updateAgencyHeader();
  }
}

function populatePasseios() {
  const sel = $('select-passeio');
  sel.innerHTML = '<option value="">Selecione o passeio...</option>';
  state.passeios.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.nome + (p.duracao ? ' — ' + p.duracao : '');
    opt.dataset.preco    = p.preco || 0;
    opt.dataset.inclusos = p.inclusos || '';
    sel.appendChild(opt);
  });
}

$('select-passeio').addEventListener('change', () => {
  const opt = $('select-passeio').selectedOptions[0];
  const precoEl = $('passeio-preco');
  if (opt && opt.value) {
    const preco = parseFloat(opt.dataset.preco) || 0;
    precoEl.textContent = preco > 0 ? 'R$ ' + preco.toFixed(2).replace('.', ',') + ' por pessoa' : '';
    precoEl.classList.remove('hidden');
  } else {
    precoEl.classList.add('hidden');
  }
  calcularTotal();
});

$('input-acompanhantes').addEventListener('input', calcularTotal);

function calcularTotal() {
  const opt = $('select-passeio').selectedOptions[0];
  if (!opt || !opt.value) return;
  const preco = parseFloat(opt.dataset.preco) || 0;
  const qtd   = 1 + (parseInt($('input-acompanhantes').value) || 0);
  const total = preco * qtd;
  $('input-total').value = total > 0 ? total.toFixed(2) : '';
}

$('form-voucher').addEventListener('submit', async e => {
  e.preventDefault();
  const passeioId      = $('select-passeio').value;
  const clienteNome    = $('input-cliente-nome').value.trim();
  const data           = $('input-data').value;
  const acompanhantes  = $('input-acompanhantes').value;
  const total          = $('input-total').value;

  if (!passeioId)   return showToast('Selecione um passeio', 'error');
  if (!clienteNome) return showToast('Informe o nome do cliente', 'error');
  if (!data)        return showToast('Informe a data do passeio', 'error');

  showLoading('Gerando voucher...');

  const res = await api('gerarVoucher', {
    ...state.auth,
    passeioId,
    clienteNome,
    data,
    acompanhantes: parseInt(acompanhantes) || 0,
    total: total ? parseFloat(total) : undefined
  });

  hideLoading();

  if (!res.success) {
    showToast(res.error || 'Erro ao gerar voucher', 'error');
    return;
  }

  showVoucherPreview(res.voucher);
});

// ── Preview do PDF ────────────────────────────────────────────
function showVoucherPreview(voucher) {
  const pdfBytes  = Uint8Array.from(atob(voucher.pdfBase64), c => c.charCodeAt(0));
  const blob      = new Blob([pdfBytes], { type: 'application/pdf' });
  const url       = URL.createObjectURL(blob);
  const numStr    = String(voucher.numero).padStart(4, '0');

  // iframe para visualização
  const iframe = $('pdf-preview-iframe');
  iframe.src = url;

  // Botão download
  $('btn-download-pdf').onclick = () => {
    const a = document.createElement('a');
    a.href     = url;
    a.download = `voucher_${numStr}_${sanitizeFilename(voucher.dados.clienteNome)}.pdf`;
    a.click();
  };

  // Botão compartilhar (Web Share API)
  const shareBtn = $('btn-share-pdf');
  if (navigator.share) {
    shareBtn.classList.remove('hidden');
    shareBtn.onclick = async () => {
      const file = new File([blob], `voucher_${numStr}.pdf`, { type: 'application/pdf' });
      try {
        await navigator.share({ files: [file], title: 'Voucher Reserva Fácil', text: `Voucher Nº ${numStr}` });
      } catch (_) {}
    };
  } else {
    shareBtn.classList.add('hidden');
  }

  $('preview-voucher-num').textContent = `Nº ${numStr} — ${voucher.dados.clienteNome}`;
  showScreen('preview');
}

$('btn-back-from-preview').addEventListener('click', () => showScreen('voucher'));

$('btn-novo-voucher').addEventListener('click', () => {
  $('form-voucher').reset();
  $('passeio-preco').classList.add('hidden');
  showScreen('voucher');
});

// ── Logout ────────────────────────────────────────────────────
$('btn-logout').addEventListener('click', () => {
  if (!confirm('Sair do sistema?')) return;
  localStorage.removeItem(STORAGE_KEY);
  state.auth = null;
  state.passeios = [];
  $('input-agencia-id').value = '';
  $('input-token').value = '';
  showScreen('login');
});

// ── Header ────────────────────────────────────────────────────
function updateAgencyHeader() {
  const el = $('header-agency-name');
  if (el && state.auth) el.textContent = state.auth.nomeAgencia;
}

// ── Setup Wizard ──────────────────────────────────────────────
$('btn-open-wizard').addEventListener('click', () => {
  state.wizard = { step: 1, data: {} };
  renderWizardStep(1);
  showScreen('wizard');
});

$('btn-close-wizard').addEventListener('click', () => showScreen('login'));

$('btn-wizard-next').addEventListener('click', () => wizardNext());
$('btn-wizard-back').addEventListener('click', () => wizardBack());

const WIZARD_STEPS = [
  { id: 1, label: 'Dados',      icon: '🏢' },
  { id: 2, label: 'Aparência',  icon: '🎨' },
  { id: 3, label: 'Passeios',   icon: '🗺️' },
  { id: 4, label: 'Revisão',    icon: '✅' }
];

function renderWizardStep(step) {
  // Atualiza step indicator
  const stepsEl = $('wizard-steps');
  stepsEl.innerHTML = WIZARD_STEPS.map(s => `
    <div class="wizard-step ${s.id === step ? 'active' : ''} ${s.id < step ? 'done' : ''}">
      <span class="step-num">${s.id < step ? '✓' : s.id}</span>
      ${s.icon} ${s.label}
    </div>
  `).join('');

  // Renderiza conteúdo do step
  const content = $('wizard-content');
  content.innerHTML = getWizardStepHTML(step);

  // Pré-preenche com dados salvos
  fillWizardFormFromState(step);

  // Controles de navegação
  $('btn-wizard-back').classList.toggle('hidden', step === 1);
  $('btn-wizard-next').textContent = step < 4 ? 'Próximo →' : '🚀 Criar Agência';

  // Sync color pickers ↔ hex inputs
  if (step === 2) setupColorPickers();

  state.wizard.step = step;
}

function getWizardStepHTML(step) {
  const d = state.wizard.data;
  switch (step) {
    case 1: return `
      <div class="card">
        <div class="card-title">Dados da Agência</div>
        <div class="form-group">
          <label>Nome da Agência *</label>
          <input id="wz-nome" type="text" placeholder="Ex: Turismo Paraíso" value="${esc(d.nome)}" required>
        </div>
        <div class="form-group">
          <label>Email *</label>
          <input id="wz-email" type="email" placeholder="contato@suaagencia.com" value="${esc(d.email)}" required>
        </div>
        <div class="form-group">
          <label>Telefone / WhatsApp</label>
          <input id="wz-telefone" type="tel" placeholder="(11) 98765-4321" value="${esc(d.telefone)}">
        </div>
        <div class="form-group">
          <label>Endereço</label>
          <input id="wz-endereco" type="text" placeholder="Cidade, Estado" value="${esc(d.endereco)}">
        </div>
        <div class="form-group">
          <label>Website</label>
          <input id="wz-website" type="url" placeholder="https://suaagencia.com" value="${esc(d.website)}">
        </div>
      </div>`;

    case 2: return `
      <div class="card">
        <div class="card-title">Identidade Visual</div>
        <div class="form-group">
          <label>Cor Primária</label>
          <div class="color-row">
            <input id="wz-cor1-picker" type="color" value="${d.corPrimaria || '#2563EB'}">
            <input id="wz-cor1" class="color-hex" type="text" placeholder="#2563EB" value="${esc(d.corPrimaria || '#2563EB')}" maxlength="7">
          </div>
        </div>
        <div class="form-group">
          <label>Cor Secundária</label>
          <div class="color-row">
            <input id="wz-cor2-picker" type="color" value="${d.corSecundaria || '#1E40AF'}">
            <input id="wz-cor2" class="color-hex" type="text" placeholder="#1E40AF" value="${esc(d.corSecundaria || '#1E40AF')}" maxlength="7">
          </div>
        </div>
        <div class="form-group mt-16">
          <label>Logo (URL pública)</label>
          <input id="wz-logo" type="url" placeholder="https://..." value="${esc(d.logoUrl)}">
          <p class="text-muted mt-8">Você pode adicionar o logo depois também.</p>
        </div>
        <div id="color-preview" style="margin-top:16px;height:56px;border-radius:10px;
          background:linear-gradient(135deg,${d.corPrimaria||'#2563EB'},${d.corSecundaria||'#1E40AF'});
          display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;">
          ${esc(d.nome) || 'Preview da cor'}
        </div>
      </div>`;

    case 3: return `
      <div class="card">
        <div class="card-title">Lista de Passeios</div>
        <div class="info-box">
          <strong>Dica:</strong> Coloque um passeio por linha. Você pode adicionar mais depois pelo Google Sheets.
        </div>
        <div class="form-group">
          <label>Passeios *</label>
          <textarea id="wz-passeios" rows="8" placeholder="Trilha da Cachoeira&#10;Cidade Histórica&#10;Passeio de Barco&#10;Mergulho no Recife">${esc(d.passeios)}</textarea>
          <p class="passeios-hint text-muted">Um passeio por linha.</p>
        </div>
      </div>`;

    case 4: return `
      <div class="card">
        <div class="card-title">Revisar e Confirmar</div>
        <div class="info-box">Confira os dados antes de criar a agência.</div>
        <div class="creds-box">
          <div class="cred-row">
            <span class="cred-label">Agência</span>
            <span class="cred-value">${esc(d.nome)}</span>
          </div>
          <div class="cred-row">
            <span class="cred-label">Email</span>
            <span class="cred-value">${esc(d.email)}</span>
          </div>
          ${d.telefone ? `<div class="cred-row">
            <span class="cred-label">Telefone</span>
            <span class="cred-value">${esc(d.telefone)}</span>
          </div>` : ''}
          <div class="cred-row">
            <span class="cred-label">Cor Primária</span>
            <span class="cred-value" style="display:flex;align-items:center;gap:8px">
              <span style="display:inline-block;width:16px;height:16px;border-radius:4px;background:${d.corPrimaria||'#2563EB'}"></span>
              ${d.corPrimaria || '#2563EB'}
            </span>
          </div>
          <div class="cred-row">
            <span class="cred-label">Passeios</span>
            <span class="cred-value">${countPasseios(d.passeios)} cadastrados</span>
          </div>
        </div>
        <p class="text-muted mt-16" style="font-size:13px">
          As credenciais de acesso serão enviadas para <strong>${esc(d.email)}</strong>.
        </p>
      </div>`;
  }
}

function setupColorPickers() {
  const sync = (pickerId, hexId, previewProp) => {
    const picker = $(pickerId), hex = $(hexId);
    if (!picker || !hex) return;
    picker.addEventListener('input', () => {
      hex.value = picker.value.toUpperCase();
      updateColorPreview();
    });
    hex.addEventListener('input', () => {
      if (/^#[0-9A-Fa-f]{6}$/.test(hex.value)) {
        picker.value = hex.value;
        updateColorPreview();
      }
    });
  };
  sync('wz-cor1-picker', 'wz-cor1');
  sync('wz-cor2-picker', 'wz-cor2');
}

function updateColorPreview() {
  const c1 = $('wz-cor1')?.value || '#2563EB';
  const c2 = $('wz-cor2')?.value || '#1E40AF';
  const preview = $('color-preview');
  if (preview) {
    preview.style.background = `linear-gradient(135deg,${c1},${c2})`;
    preview.textContent = state.wizard.data.nome || 'Preview da cor';
  }
}

function saveWizardStep(step) {
  const d = state.wizard.data;
  switch (step) {
    case 1:
      d.nome     = $('wz-nome')?.value.trim() || '';
      d.email    = $('wz-email')?.value.trim() || '';
      d.telefone = $('wz-telefone')?.value.trim() || '';
      d.endereco = $('wz-endereco')?.value.trim() || '';
      d.website  = $('wz-website')?.value.trim() || '';
      break;
    case 2:
      d.corPrimaria   = $('wz-cor1')?.value || '#2563EB';
      d.corSecundaria = $('wz-cor2')?.value || '#1E40AF';
      d.logoUrl       = $('wz-logo')?.value.trim() || '';
      break;
    case 3:
      d.passeios = $('wz-passeios')?.value.trim() || '';
      break;
  }
}

function validateWizardStep(step) {
  const d = state.wizard.data;
  if (step === 1) {
    if (!d.nome)  { showToast('Informe o nome da agência', 'error'); return false; }
    if (!d.email) { showToast('Informe o email', 'error'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
      showToast('Email inválido', 'error'); return false;
    }
  }
  if (step === 3 && !d.passeios.trim()) {
    showToast('Adicione pelo menos um passeio', 'error'); return false;
  }
  return true;
}

function fillWizardFormFromState(step) {
  // fillWizardFormFromState não precisa fazer nada — o HTML já injeta os valores
}

async function wizardNext() {
  saveWizardStep(state.wizard.step);
  if (!validateWizardStep(state.wizard.step)) return;

  if (state.wizard.step < 4) {
    renderWizardStep(state.wizard.step + 1);
    return;
  }

  // Step 4 → submete
  setBtnLoading($('btn-wizard-next'), true);

  const res = await api('setupAgencia', {
    ...state.wizard.data
  });

  setBtnLoading($('btn-wizard-next'), false);

  if (!res.success) {
    showToast(res.error || 'Erro ao criar agência', 'error');
    return;
  }

  showWizardSuccess(res);
}

function wizardBack() {
  saveWizardStep(state.wizard.step);
  if (state.wizard.step > 1) renderWizardStep(state.wizard.step - 1);
}

function showWizardSuccess(res) {
  $('success-agencia-id').textContent = res.agenciaId;
  $('success-token').textContent      = res.token;
  showScreen('success');
}

$('btn-ir-login').addEventListener('click', () => showScreen('login'));

// ── API helper ────────────────────────────────────────────────
async function api(action, params = {}) {
  try {
    const res = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action, ...params })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    return { success: false, error: 'Erro de conexão: ' + e.message };
  }
}

// ── Loading overlay ───────────────────────────────────────────
function showLoading(msg) {
  $('loading-msg').textContent = msg || 'Aguarde...';
  $('loading-overlay').classList.remove('hidden');
}
function hideLoading() {
  $('loading-overlay').classList.add('hidden');
}

// ── Toasts ────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = $('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── Button loading ────────────────────────────────────────────
function setBtnLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.classList.toggle('btn-loading', loading);
}

// ── Helpers ───────────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sanitizeFilename(str) {
  return String(str || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '_').substring(0, 30);
}

function countPasseios(str) {
  if (!str) return 0;
  return str.split('\n').filter(l => l.trim()).length;
}
