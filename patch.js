/**
 * anushree-patch.js
 * Patch v2 — injected into index.html
 * Adds:
 *   1. Ledger summary (total purchases / payments / outstanding) in customer detail
 *   2. Transaction type filter (All / Sales / Payments)
 *   3. Aging — "pending since X days" on customer cards and detail
 *   4. Dashboard reorder — outstanding-first, collection-focused
 *   5. WhatsApp reminder deep link
 *   6. "Collect Full" shortcut in payment quick-bar
 */

/* ── PATCH CSS (injected into <head>) ──────────────────────────────────────── */
const PATCH_CSS = `
/* Ledger summary strip */
.ledger-summary {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
  background: var(--white);
}
.ls-cell {
  padding: 10px 8px;
  text-align: center;
  border-right: 1px solid var(--border);
}
.ls-cell:last-child { border-right: none; }
.ls-cell-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 3px;
}
.ls-cell-val {
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  font-weight: 700;
}
.ls-cell-val.purchases { color: var(--red); }
.ls-cell-val.payments  { color: var(--green); }
.ls-cell-val.balance   { color: var(--maroon); }

/* Transaction filter pills */
.txn-filter {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}
.tf-pill {
  flex: 1;
  padding: 7px 4px;
  border: 1.5px solid var(--border);
  border-radius: 20px;
  background: var(--white);
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  text-align: center;
  cursor: pointer;
  transition: all .15s;
}
.tf-pill.active {
  background: var(--maroon);
  color: white;
  border-color: var(--maroon);
}

/* Aging badge on customer cards */
.aging-badge {
  display: inline-block;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  margin-top: 2px;
  letter-spacing: 0.3px;
}
.aging-badge.urgent { background: var(--red-light); color: var(--red); }
.aging-badge.warn   { background: var(--gold-light); color: var(--gold); }
.aging-badge.ok     { background: var(--green-light); color: var(--green); }

/* WhatsApp button */
.wa-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 12px;
  background: #25D366;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 12px;
  text-decoration: none;
  box-shadow: 0 2px 10px rgba(37,211,102,0.3);
}

/* Collect full shortcut */
.collect-full-btn {
  background: var(--green-light);
  color: var(--green);
  border: 1.5px solid var(--green);
  border-radius: 7px;
  padding: 9px 13px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

/* Dashboard outstanding hero — more aggressive */
.outstanding-hero {
  background: linear-gradient(135deg, var(--maroon) 0%, #5C001F 100%);
  border-radius: 14px;
  padding: 18px 18px 14px;
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
}
.oh-label {
  font-size: 10px;
  color: rgba(255,255,255,0.6);
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.oh-amount {
  font-family: 'Roboto Mono', monospace;
  font-size: 36px;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 6px;
}
.oh-row {
  display: flex;
  gap: 14px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.15);
}
.oh-chip {
  font-size: 11px;
  color: rgba(255,255,255,0.75);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}
.oh-chip b { color: white; font-family: 'Roboto Mono', monospace; }

/* Aging line in detail */
.aging-line {
  font-size: 11px;
  color: var(--muted);
  margin-top: 3px;
}
.aging-line.urgent { color: var(--red); font-weight: 700; }
`;

/* ── HELPERS ─────────────────────────────────────────────────────────────── */
function daysSince(isoDate) {
  if (!isoDate) return null;
  const ms = Date.now() - new Date(isoDate).getTime();
  return Math.floor(ms / 86400000);
}

function lastTxnDate(custId, type) {
  // most recent transaction of given type (or any if type=null)
  const txns = transactions
    .filter(x => x.customerId === custId && (!type || x.type === type))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return txns.length ? txns[0].date : null;
}

function agingText(custId, lang) {
  const lastSale = lastTxnDate(custId, 'sale');
  const lastPay  = lastTxnDate(custId, 'payment');
  const b = bal(custId);
  if (b <= 0) return null;
  // use last payment date if exists, else last sale date
  const refDate = lastPay || lastSale;
  if (!refDate) return null;
  const days = daysSince(refDate);
  if (lang === 'hi') {
    if (lastPay) return `आखिरी भुगतान ${days} दिन पहले`;
    return `${days} दिन से बकाया`;
  } else {
    if (lastPay) return `Last payment ${days} days ago`;
    return `Owing for ${days} days`;
  }
}

function agingClass(custId) {
  const lastPay  = lastTxnDate(custId, 'payment');
  const lastSale = lastTxnDate(custId, 'sale');
  const refDate  = lastPay || lastSale;
  if (!refDate) return 'warn';
  const days = daysSince(refDate);
  if (days >= 30) return 'urgent';
  if (days >= 14) return 'warn';
  return 'ok';
}

function waMessage(custName, balance, shopName) {
  const amt = Number(balance || 0).toLocaleString('en-IN');
  if (lang === 'hi') {
    return `नमस्ते ${custName} जी,\n\nआपका बकाया भुगतान ₹${amt} है।\nकृपया जल्द भुगतान करें।\n\nधन्यवाद,\n${shopName}`;
  }
  return `Namaste ${custName} ji,\n\nYour outstanding balance is ₹${amt}.\nKindly make the payment at your earliest convenience.\n\nThank you,\n${shopName}`;
}

/* ── TXN FILTER STATE ────────────────────────────────────────────────────── */
let txnFilter = 'all'; // 'all' | 'sale' | 'payment'
function setTxnFilter(f) { txnFilter = f; renderDetail(); }

/* ── PATCHED renderHome ──────────────────────────────────────────────────── */
function renderHome() {
  const now = new Date(), m = now.getMonth(), y = now.getFullYear();

  const totalDue = customers.reduce((s, c) => s + Math.max(0, bal(c.id)), 0);
  const custWithDue = customers.filter(c => bal(c.id) > 0).length;

  const mTx    = transactions.filter(tx => { const d = new Date(tx.date); return d.getMonth() === m && d.getFullYear() === y; });
  const mSale  = mTx.filter(x => x.type === 'sale').reduce((s, x) => s + x.amount, 0);
  const mPaid  = mTx.filter(x => x.type === 'payment').reduce((s, x) => s + x.amount, 0);
  const allSales = transactions.filter(x => x.type === 'sale').reduce((s, x) => s + x.amount, 0);

  // Bar chart — 6 months
  const bars = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, m - i, 1), bm = d.getMonth(), by = d.getFullYear();
    const v = transactions.filter(x => { const dd = new Date(x.date); return x.type === 'sale' && dd.getMonth() === bm && dd.getFullYear() === by; }).reduce((s, x) => s + x.amount, 0);
    bars.push({ label: t('months')[bm], v, now: i === 0 });
  }
  const maxB = Math.max(...bars.map(b => b.v), 1);

  // Pie
  const pC = mPaid, pO = Math.max(0, mSale - mPaid), pT = pC + pO || 1;
  const pct = Math.round(pC / pT * 100);
  const pol = (cx, cy, r, deg) => { const rad = (deg - 90) * Math.PI / 180; return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }; };
  const slice = (cx, cy, r, s, e, col) => { if (e - s >= 360) return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>`; const a = pol(cx, cy, r, s), b = pol(cx, cy, r, e), lg = e - s > 180 ? 1 : 0; return `<path d="M${cx},${cy} L${a.x},${a.y} A${r},${r} 0 ${lg},1 ${b.x},${b.y} Z" fill="${col}"/>`; };

  // Top debtors — sort by balance, show aging
  const debtors = customers
    .map(c => ({ ...c, b: bal(c.id) }))
    .filter(c => c.b > 0)
    .sort((a, z) => z.b - a.b)
    .slice(0, 5);

  // Recent
  const recent = [...transactions].filter(x => x.type === 'sale').sort((a, z) => new Date(z.date) - new Date(a.date)).slice(0, 3);

  document.getElementById('home-content').innerHTML = `

    <!-- 1. OUTSTANDING HERO — collection first -->
    <div class="outstanding-hero">
      <div class="oh-label">⚠ ${t('totalDue')}</div>
      <div class="oh-amount">${fmt(totalDue)}</div>
      <div class="oh-row">
        <div class="oh-chip">👩‍👩‍👧 <b>${custWithDue}</b> ${lang === 'hi' ? 'ग्राहक बकाया' : 'customers owing'}</div>
        <div class="oh-chip">💰 <b>${fmt(mPaid)}</b> ${lang === 'hi' ? 'वसूल' : 'collected'}</div>
      </div>
    </div>

    <!-- 2. MINI STATS -->
    <div class="stats-row">
      <div class="stat-mini"><div class="sm-label">${t('monthSale')}</div><div class="sm-val gold">${fmt(mSale)}</div></div>
      <div class="stat-mini g"><div class="sm-label">${t('allTime')}</div><div class="sm-val green">${fmt(allSales)}</div></div>
    </div>

    <!-- 3. TOP DEBTORS — prominent, with aging -->
    ${debtors.length > 0 ? `
    <div class="sec-head">⚠ ${t('topDebtors')}</div>
    ${debtors.map(c => {
      const ag = agingText(c.id, lang);
      const agCls = agingClass(c.id);
      return `
      <div class="cust-card red" onclick="openDetail('${c.id}')">
        <div class="avatar">${c.photo ? `<img src="${c.photo}"/>` : initial(c.name)}</div>
        <div class="ci">
          <div class="ci-name">${c.name}</div>
          <div class="ci-bal red">${fmt(c.b)}</div>
          ${ag ? `<div class="aging-badge ${agCls}">${ag}</div>` : ''}
        </div>
        <a class="call-btn" href="tel:${c.phone}" onclick="event.stopPropagation()">📞</a>
      </div>`;
    }).join('')}` : ''}

    <!-- 4. BAR CHART -->
    <div class="chart-box" style="margin-top:4px">
      <div class="chart-title"><span>${t('chartTitle')}</span><span style="color:var(--maroon);font-family:'Roboto Mono',monospace;font-size:11px">${fmt(mSale)}</span></div>
      ${bars.every(b => b.v === 0)
        ? `<div style="text-align:center;padding:20px;color:var(--muted);font-size:12px">${t('noSales')}</div>`
        : `<div class="chart-wrap">
          ${bars.map(b => `<div class="bar-col"><div class="bar-inner"><div class="bar ${b.now ? 'now' : ''}" style="height:${Math.max(3, b.v / maxB * 80)}px">${b.v > 0 ? `<span class="bar-v">${b.v >= 1000 ? (b.v / 1000).toFixed(0) + 'k' : b.v}</span>` : ''}</div></div><div class="bar-l">${b.label}</div></div>`).join('')}
        </div>`
      }
    </div>

    <!-- 5. PIE CHART -->
    ${mSale > 0 ? `
    <div class="pie-box">
      <div class="pie-title">${t('pieTitle')}</div>
      <div class="pie-wrap">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="#eee"/>
          ${slice(40, 40, 36, 0, pct * 3.6, '#1B6B3A')}
          ${pct < 100 ? slice(40, 40, 36, pct * 3.6, 360, '#B71C1C') : ''}
          <circle cx="40" cy="40" r="22" fill="white"/>
          <text x="40" y="44" text-anchor="middle" font-size="11" font-weight="700" font-family="Roboto Mono,monospace" fill="#1A1A1A">${pct}%</text>
        </svg>
        <div style="flex:1">
          <div class="pie-legend-item"><div class="pie-dot" style="background:var(--green)"></div><div class="pie-lbl">${t('collected')}</div><div class="pie-v">${fmt(pC)}</div></div>
          <div class="pie-legend-item"><div class="pie-dot" style="background:var(--red)"></div><div class="pie-lbl">${t('owing')}</div><div class="pie-v">${fmt(pO)}</div></div>
        </div>
      </div>
    </div>` : ''}

    <!-- 6. RECENT SALES -->
    ${recent.length > 0 ? `
    <div class="sec-head">${t('recentSales')}</div>
    ${recent.map(tx => {
      const c = customers.find(x => x.id === tx.customerId);
      return `<div class="txn" onclick="${c ? `openDetail('${tx.customerId}')` : ''}">
        <div class="txn-top"><span style="font-size:12px;font-weight:700">${c ? c.name : '—'}</span><span class="txn-amt sale">${fmt(tx.amount)}</span></div>
        ${tx.desc ? `<div class="txn-desc">${tx.desc}</div>` : ''}
        <div class="txn-date">${fmtDate(tx.date)}</div>
        ${tx.photo ? `<img class="txn-img" src="${tx.photo}" onclick="event.stopPropagation();openPV('${tx.photo}')"/>` : ''}
      </div>`;
    }).join('')}` : ''}
  `;
}

/* ── PATCHED renderDetail ────────────────────────────────────────────────── */
function renderDetail() {
  const id = curCustId;
  const c = customers.find(x => x.id === id); if (!c) return;

  const allTxns = [...transactions].filter(x => x.customerId === id).sort((a, z) => new Date(z.date) - new Date(a.date));
  const filtered = txnFilter === 'all' ? allTxns : allTxns.filter(x => x.type === txnFilter);

  const b = bal(id);
  const clear = b <= 0;

  // Ledger summary
  const totalPurchases = allTxns.filter(x => x.type === 'sale').reduce((s, x) => s + x.amount, 0);
  const totalPayments  = allTxns.filter(x => x.type === 'payment').reduce((s, x) => s + x.amount, 0);

  // Aging
  const ag = agingText(id, lang);
  const agCls = agingClass(id);

  // WhatsApp
  const shopName = lang === 'hi' ? 'अनुश्री वस्त्रालय' : 'Anushree Vastralaya';
  const waMsg = encodeURIComponent(waMessage(c.name, b, shopName));
  const waUrl = `https://wa.me/91${c.phone.replace(/\D/g, '')}?text=${waMsg}`;

  document.getElementById('ov-body').innerHTML = `

    <!-- BALANCE HERO -->
    <div class="bal-hero ${clear ? 'clear' : 'owing'}">
      <div class="bh-label">${clear ? '' : t('balance')}</div>
      <div class="bh-amount ${clear ? 'clear' : 'owing'}">${clear ? t('allClear') : fmt(b)}</div>
      ${ag && !clear ? `<div class="aging-line ${agCls}" style="margin-top:5px">${ag}</div>` : ''}
    </div>

    <!-- LEDGER SUMMARY -->
    <div class="ledger-summary">
      <div class="ls-cell">
        <div class="ls-cell-label">${lang === 'hi' ? 'कुल खरीद' : 'Purchases'}</div>
        <div class="ls-cell-val purchases">${fmt(totalPurchases)}</div>
      </div>
      <div class="ls-cell">
        <div class="ls-cell-label">${lang === 'hi' ? 'कुल भुगतान' : 'Paid'}</div>
        <div class="ls-cell-val payments">${fmt(totalPayments)}</div>
      </div>
      <div class="ls-cell">
        <div class="ls-cell-label">${lang === 'hi' ? 'बकाया' : 'Balance'}</div>
        <div class="ls-cell-val balance">${fmt(Math.max(0, b))}</div>
      </div>
    </div>

    <!-- QUICK PAY with Collect Full shortcut -->
    ${!clear ? `
    <div class="pay-bar">
      <input id="qp-input" type="number" inputmode="decimal" placeholder="${t('payAmt')}"/>
      <button class="collect-full-btn" onclick="collectFull(${b})">
        ${lang === 'hi' ? '✓ पूरा' : '✓ Full'}
      </button>
      <button onclick="quickPay()">${lang === 'hi' ? 'दर्ज' : 'Save'}</button>
    </div>` : ''}

    <!-- WHATSAPP REMINDER -->
    ${!clear ? `
    <a class="wa-btn" href="${waUrl}" target="_blank" rel="noopener">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      ${lang === 'hi' ? 'WhatsApp पर याद दिलाएँ' : 'Send WhatsApp Reminder'}
    </a>` : ''}

    <!-- EDIT CUSTOMER -->
    <div style="margin-bottom:10px">
      <button onclick="toggleEditCust()" style="background:var(--blue-light);color:var(--blue);border:none;padding:7px 13px;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer">✏️ ${t('editCust')}</button>
    </div>

    ${editCustMode ? `
    <div class="edit-cust-bar" style="flex-wrap:wrap;gap:7px">
      <input id="ec-name" type="text" value="${c.name}" style="flex:1;min-width:100px"/>
      <input id="ec-phone" type="tel" value="${c.phone}" style="flex:1;min-width:100px"/>
      <button class="ec-save" onclick="saveEditCust()">✓ सेव</button>
      <button class="ec-del" onclick="startDelCust()">🗑 हटाएँ</button>
    </div>` : ''}

    ${delCustConfirm ? `
    <div style="background:var(--red-light);border:1.5px solid var(--red);border-radius:8px;padding:12px;margin-bottom:10px;text-align:center">
      <div style="font-size:13px;font-weight:700;color:var(--red);margin-bottom:10px">${t('delCust')}</div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button onclick="confirmDelCust()" style="background:var(--red);color:white;border:none;padding:8px 16px;border-radius:7px;font-size:13px;font-weight:700;cursor:pointer">${t('delCustSure')}</button>
        <button onclick="cancelDelCust()" style="background:var(--white);border:1px solid var(--border);padding:8px 16px;border-radius:7px;font-size:13px;cursor:pointer">${t('cancel')}</button>
      </div>
    </div>` : ''}

    <!-- TXN FILTER -->
    <div class="txn-filter">
      <div class="tf-pill ${txnFilter === 'all' ? 'active' : ''}" onclick="setTxnFilter('all')">${lang === 'hi' ? 'सभी' : 'All'}</div>
      <div class="tf-pill ${txnFilter === 'sale' ? 'active' : ''}" onclick="setTxnFilter('sale')">${lang === 'hi' ? 'बिक्री' : 'Sales'}</div>
      <div class="tf-pill ${txnFilter === 'payment' ? 'active' : ''}" onclick="setTxnFilter('payment')">${lang === 'hi' ? 'भुगतान' : 'Payments'}</div>
    </div>

    <!-- DELETE CONFIRM STRIP -->
    ${deletingTxnId ? `
    <div style="background:var(--red-light);border:1.5px solid var(--red);border-radius:8px;padding:11px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:8px">
      <span style="font-size:12px;font-weight:700;color:var(--red)">${lang === 'hi' ? 'क्या यह एंट्री हटाएँ?' : 'Delete this entry?'}</span>
      <div style="display:flex;gap:6px">
        <button onclick="confirmDeleteTxn()" style="background:var(--red);color:white;border:none;padding:6px 12px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer">${t('delCustSure')}</button>
        <button onclick="cancelDeleteTxn()" style="background:var(--white);border:1px solid var(--border);padding:6px 10px;border-radius:6px;font-size:11px;cursor:pointer">${t('cancel')}</button>
      </div>
    </div>` : ''}

    <!-- TRANSACTIONS -->
    ${filtered.length === 0
      ? `<div class="empty"><div class="empty-icon">📋</div><div class="empty-text">${t('noTxn')}</div></div>`
      : filtered.map(tx => `
        <div class="txn">
          <div class="txn-top">
            <span class="txn-tag ${tx.type}">${tx.type === 'sale' ? t('sale') : t('payment')}</span>
            <span class="txn-amt ${tx.type}">${tx.type === 'sale' ? '+' : '-'}${fmt(tx.amount)}</span>
          </div>
          ${tx.desc ? `<div class="txn-desc">${tx.desc}</div>` : ''}
          <div class="txn-date">${fmtDate(tx.date)}</div>
          ${tx.photo ? `<img class="txn-img" src="${tx.photo}" onclick="openPV('${tx.photo}')"/>` : ''}
          <div class="txn-actions">
            <button class="txn-edit" onclick="openEditModal('${tx.id}')">✏️ ${lang === 'hi' ? 'सुधारें' : 'Edit'}</button>
            <button class="txn-del" onclick="startDeleteTxn('${tx.id}')">🗑 ${lang === 'hi' ? 'हटाएँ' : 'Delete'}</button>
          </div>
        </div>`).join('')
    }
  `;
}

/* ── NEW: collectFull shortcut ───────────────────────────────────────────── */
function collectFull(amount) {
  const input = document.getElementById('qp-input');
  if (input) input.value = amount;
}

/* ── INJECT CSS into <head> ─────────────────────────────────────────────── */
(function injectCSS() {
  const style = document.createElement('style');
  style.textContent = PATCH_CSS;
  document.head.appendChild(style);
})();
