/* js/theme.js — theme switching, text size, settings modal */

const THEMES = [
  { id: 'default', bars: ['#E91E63', '#C2185B'] },
  { id: 'neo',      bars: ['#111111', '#FFD400'] },
  { id: 'bauhaus',  bars: ['#1356A2', '#E63312', '#F2B705'] },
];
const SIZES = ['sm', 'md', 'lg'];
const SIZE_SCALE = { sm: 0.92, md: 1, lg: 1.14 };

function getTheme()    { return localStorage.getItem('av_theme') || 'default'; }
function getTextSize() { return localStorage.getItem('av_size')  || 'md'; }

function applyTheme(id) {
  document.documentElement.setAttribute('data-theme', id);
  const metaColor = { default: '#C2185B', neo: '#111111', bauhaus: '#1356A2' }[id] || '#C2185B';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', metaColor);
}
function applyTextSize(size) {
  document.documentElement.style.setProperty('--text-scale', SIZE_SCALE[size] || 1);
}

// Called immediately (inline, pre-paint) — see index.html head script.
function bootTheme() {
  applyTheme(getTheme());
  applyTextSize(getTextSize());
}

function setTheme(id) {
  localStorage.setItem('av_theme', id);
  applyTheme(id);
  renderSettings();
}
function setTextSize(size) {
  localStorage.setItem('av_size', size);
  applyTextSize(size);
  renderSettings();
}

function openSettings() {
  renderSettings();
  document.getElementById('settings-modal').classList.add('open');
}
function closeSettings() {
  document.getElementById('settings-modal').classList.remove('open');
}

function renderSettings() {
  const curTheme = getTheme();
  const curSize  = getTextSize();

  document.getElementById('settings-body').innerHTML = `
    <div class="settings-row-label">${t('themeLbl')}</div>
    <div class="theme-grid">
      ${THEMES.map(th => `
        <div class="theme-swatch ${th.id === curTheme ? 'active' : ''}" onclick="setTheme('${th.id}')">
          <div class="theme-preview-bar">${th.bars.map(c => `<span style="background:${c}"></span>`).join('')}</div>
          <div class="theme-swatch-name">${t('theme' + th.id.charAt(0).toUpperCase() + th.id.slice(1))}</div>
        </div>`).join('')}
    </div>

    <div class="settings-row-label">${t('textSizeLbl')}</div>
    <div class="size-toggle">
      ${SIZES.map(s => `
        <div class="size-opt ${s === curSize ? 'active' : ''}" onclick="setTextSize('${s}')">
          ${t('size' + (s === 'sm' ? 'Small' : s === 'md' ? 'Normal' : 'Large'))}
        </div>`).join('')}
    </div>
  `;
}

bootTheme(); // re-applies theme + sets meta theme-color (inline head script only set the CSS attr/var pre-paint)
