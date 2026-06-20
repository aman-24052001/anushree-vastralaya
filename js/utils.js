/* js/utils.js — shared utilities */

let customers = [], transactions = [];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
// Safe for interpolating into a single-quoted HTML attribute (onclick="...('${esc(name)}')")
const esc = s => String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/</g, '&lt;');
const fmtDate = iso => {
  const d = new Date(iso);
  return d.getDate() + ' ' + t('months')[d.getMonth()] + ' ' + d.getFullYear();
};
const toISO = d => d ? new Date(d).toISOString() : new Date().toISOString();
const initial = n => n ? n.charAt(0).toUpperCase() : '?';

// Balance = always computed, never stored
const bal = id => transactions
  .filter(x => x.customerId === id)
  .reduce((s, x) => x.type === 'sale' ? s + x.amount : s - x.amount, 0);

// Aging helpers
const daysSince = isoDate => {
  if (!isoDate) return null;
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000);
};

const lastTxnDate = (custId, type) => {
  const txns = transactions
    .filter(x => x.customerId === custId && (!type || x.type === type))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return txns.length ? txns[0].date : null;
};

const agingText = custId => {
  const b = bal(custId);
  if (b <= 0) return null;
  const lastPay  = lastTxnDate(custId, 'payment');
  const lastSale = lastTxnDate(custId, 'sale');
  const refDate  = lastPay || lastSale;
  if (!refDate) return null;
  const days = daysSince(refDate);
  return lastPay ? L[lang].agingLastPay(days) : L[lang].agingDays(days);
};

const agingClass = custId => {
  const lastPay  = lastTxnDate(custId, 'payment');
  const lastSale = lastTxnDate(custId, 'sale');
  const refDate  = lastPay || lastSale;
  if (!refDate) return 'warn';
  const days = daysSince(refDate);
  return days >= 30 ? 'urgent' : days >= 14 ? 'warn' : 'ok';
};

// Avatar HTML
const avatarHTML = (c, large = false) =>
  `<div class="avatar${large ? ' large' : ''}">${c.photo ? `<img src="${c.photo}"/>` : initial(c.name)}</div>`;

// Toast
function vibrate(ms = 18) {
  if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} }
}

function toast(msg, dur = 2000) {
  const el = document.getElementById('toast');
  el.classList.remove('undo-toast');
  el.innerHTML = `<span>✓ ${msg}</span>`;
  el.classList.add('show');
  vibrate(16);
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), dur);
}

// Toast with an Undo action — caller passes onUndo callback; auto-commits after `dur` ms
function toastUndo(msg, onUndo, dur = 4500) {
  const el = document.getElementById('toast');
  el.classList.add('undo-toast');
  el.innerHTML = `<span style="flex:1">${msg}</span><button class="toast-undo-btn" id="toast-undo-btn">${t('undoBtn')}</button>`;
  el.classList.add('show');
  vibrate(16);
  clearTimeout(el._t);
  let undone = false;
  document.getElementById('toast-undo-btn').onclick = () => {
    undone = true;
    el.classList.remove('show');
    onUndo();
  };
  el._t = setTimeout(() => {
    el.classList.remove('show');
    el.classList.remove('undo-toast');
  }, dur);
  return () => undone; // caller can check if it was undone before committing
}

// Recent customers (most recently transacted-with, for quick-pick trays)
function recentCustomers(limit = 8) {
  const seen = new Set();
  const ordered = [];
  [...transactions]
    .sort((a, z) => new Date(z.date) - new Date(a.date))
    .forEach(tx => {
      if (!seen.has(tx.customerId)) { seen.add(tx.customerId); ordered.push(tx.customerId); }
    });
  return ordered
    .map(id => customers.find(c => c.id === id))
    .filter(Boolean)
    .slice(0, limit);
}

function recentTrayHTML(onPickFnName) {
  const list = recentCustomers(8);
  if (!list.length) return '';
  return `
    <div class="recent-tray-label">${t('recentCust')}</div>
    <div class="recent-tray">
      ${list.map(c => `
        <div class="recent-chip" onclick="${onPickFnName}('${c.id}','${c.name.replace(/'/g, "\\'").replace(/"/g, '&quot;')}')">
          ${avatarHTML(c)}
          <span>${c.name.split(' ')[0]}</span>
        </div>`).join('')}
    </div>`;
}


// Load all data
async function loadData() {
  customers = await dbAll('customers');
  transactions = await dbAll('transactions');
}

// Photo compress
function compressPhoto(file, callback) {
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const max = 800;
      let w = img.width, h = img.height;
      if (w > max) { h = Math.round(h * max / w); w = max; }
      if (h > max) { w = Math.round(w * max / h); h = max; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

// Photo viewer
function openPV(src) {
  document.getElementById('pv-img').src = src;
  document.getElementById('pv').classList.add('open');
}
function closePV() {
  document.getElementById('pv').classList.remove('open');
  document.getElementById('pv-img').src = '';
}

// WhatsApp deep link
function waUrl(phone, name, balance) {
  const shopName = lang === 'hi' ? 'अनुश्री वस्त्रालय' : 'Anushree Vastralaya';
  const amt = Number(balance || 0).toLocaleString('en-IN');
  const msg = L[lang].waMsg(name, amt, shopName);
  return `https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
}

// Pie chart SVG helper
function pieSliceSVG(cx, cy, r, startDeg, endDeg, color) {
  if (endDeg - startDeg >= 360)
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`;
  const toXY = deg => {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const s = toXY(startDeg), e = toXY(endDeg);
  const lg = endDeg - startDeg > 180 ? 1 : 0;
  return `<path d="M${cx},${cy} L${s.x},${s.y} A${r},${r} 0 ${lg},1 ${e.x},${e.y} Z" fill="${color}"/>`;
}

// Live Indian-comma amount preview under an input as the user types
function wireLivePreview(inputId, previewId) {
  const inp = document.getElementById(inputId);
  const prev = document.getElementById(previewId);
  if (!inp || !prev) return;
  const update = () => {
    const v = parseFloat(inp.value);
    prev.textContent = v > 0 ? fmt(v) : '';
  };
  inp.addEventListener('input', update);
  update();
}
