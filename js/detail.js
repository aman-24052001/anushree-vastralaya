/* js/detail.js — Customer detail overlay */

let curCustId     = null;
let txnFilter     = 'all';
let editCustMode  = false;
let delCustConf   = false;
let deletingTxnId = null;
let qpMethod      = 'cash';
let galleryExpanded = false;

function openDetail(id) {
  curCustId    = id;
  editCustMode = false;
  delCustConf  = false;
  deletingTxnId = null;
  txnFilter    = 'all';
  qpMethod     = 'cash';
  galleryExpanded = false;

  const c = customers.find(x => x.id === id); if (!c) return;
  document.getElementById('ov-name').textContent = c.name;
  document.getElementById('ov-call').href        = 'tel:' + c.phone;
  renderDetail();
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOverlay() {
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
  curCustId    = null;
  editCustMode = false;
  delCustConf  = false;
  deletingTxnId = null;
  loadData().then(renderAll);
}

// Quick pay from detail
async function quickPay() {
  const amt = parseFloat(document.getElementById('qp-input').value);
  if (!amt || amt <= 0) return;
  const tx = { id: uid(), customerId: curCustId, type: 'payment', amount: amt, desc: '', photo: null, method: qpMethod, date: new Date().toISOString() };
  await dbPut('transactions', tx);
  transactions.push(tx);
  document.getElementById('qp-input').value = '';
  qpMethod = 'cash';
  toast(t('t_pay'));
  renderDetail();
}

function setQpMethod(m) {
  const keepAmt = document.getElementById('qp-input') ? document.getElementById('qp-input').value : '';
  qpMethod = m;
  renderDetail();
  const inp = document.getElementById('qp-input');
  if (inp) inp.value = keepAmt;
}

function expandGallery() {
  galleryExpanded = true;
  renderDetail();
}

function collectFull(amount) {
  const inp = document.getElementById('qp-input');
  if (inp) inp.value = amount;
}

// Filter
function setTxnFilter(f) { txnFilter = f; renderDetail(); }

// Edit customer
function toggleEditCust() { editCustMode = !editCustMode; delCustConf = false; renderDetail(); }

async function saveEditCust() {
  const name  = document.getElementById('ec-name').value.trim();
  const phone = document.getElementById('ec-phone').value.trim();
  if (!name || !phone) { toast(t('t_fillCust')); return; }
  const c = customers.find(x => x.id === curCustId); if (!c) return;
  c.name = name; c.phone = phone;
  await dbPut('customers', c);
  document.getElementById('ov-name').textContent = name;
  document.getElementById('ov-call').href        = 'tel:' + phone;
  toast(t('t_custEdit'));
  editCustMode = false;
  renderDetail();
}

function startDelCust()  { delCustConf = true;  renderDetail(); }
function cancelDelCust() { delCustConf = false; renderDetail(); }

async function confirmDelCust() {
  const c = customers.find(x => x.id === curCustId);
  const txToRemove = transactions.filter(x => x.customerId === curCustId);
  const custIdSnapshot = curCustId;

  // Close overlay UI without the usual loadData() reload — that would re-fetch
  // this customer from IndexedDB before the deferred delete actually happens.
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
  curCustId = null; editCustMode = false; delCustConf = false; deletingTxnId = null;

  // Optimistic UI removal — actual DB delete happens only if not undone
  customers    = customers.filter(x => x.id !== custIdSnapshot);
  transactions = transactions.filter(x => x.customerId !== custIdSnapshot);
  renderAll();

  const checkUndone = toastUndo(t('t_custDelUndo'), () => {
    customers.push(c);
    transactions.push(...txToRemove);
    renderAll();
  });

  setTimeout(async () => {
    if (checkUndone()) return; // user clicked undo, do not touch DB
    for (const tx of txToRemove) { try { await dbDel('transactions', tx.id); } catch (e) {} }
    try { await dbDel('customers', custIdSnapshot); } catch (e) {}
  }, 4600);
}

// Delete txn
function startDeleteTxn(id)  { deletingTxnId = id;   renderDetail(); }
function cancelDeleteTxn()   { deletingTxnId = null;  renderDetail(); }

async function confirmDeleteTxn() {
  if (!deletingTxnId) return;
  const txId = deletingTxnId;
  const tx = transactions.find(x => x.id === txId);
  if (!tx) return;

  transactions = transactions.filter(x => x.id !== txId);
  deletingTxnId = null;
  renderDetail();

  const checkUndone = toastUndo(t('t_txnDelUndo'), () => {
    transactions.push(tx);
    renderDetail();
  });

  setTimeout(async () => {
    if (checkUndone()) return;
    try { await dbDel('transactions', txId); } catch (e) {}
  }, 4600);
}

function renderDetail() {
  const id = curCustId;
  const c  = customers.find(x => x.id === id); if (!c) return;

  const allTxns = [...transactions]
    .filter(x => x.customerId === id)
    .sort((a, z) => new Date(z.date) - new Date(a.date));

  const filtered = txnFilter === 'all' ? allTxns : allTxns.filter(x => x.type === txnFilter);

  const b     = bal(id);
  const clear = b <= 0;

  const totalPurchases = allTxns.filter(x => x.type === 'sale').reduce((s, x) => s + x.amount, 0);
  const totalPayments  = allTxns.filter(x => x.type === 'payment').reduce((s, x) => s + x.amount, 0);

  const ag    = agingText(id);
  const agCls = agingClass(id);
  const photoTxns = allTxns.filter(x => x.photo);

  document.getElementById('ov-body').innerHTML = `

    <!-- BALANCE CARD -->
    <div class="bal-card ${clear ? 'clear' : 'owing'}">
      <div>
        <div class="bc-label">${clear ? '' : t('balance')}</div>
        <div class="bc-amount ${clear ? 'clear' : 'owing'}">${clear ? t('allClear') : fmt(b)}</div>
        ${ag && !clear ? `<div class="bc-aging ${agCls}">${ag}</div>` : ''}
      </div>
      ${avatarHTML(c, true)}
    </div>

    <!-- LEDGER SUMMARY -->
    <div class="ledger-row">
      <div class="ledger-cell">
        <div class="lc-label">${t('purchases')}</div>
        <div class="lc-val red">${fmt(totalPurchases)}</div>
      </div>
      <div class="ledger-cell">
        <div class="lc-label">${t('paid')}</div>
        <div class="lc-val green">${fmt(totalPayments)}</div>
      </div>
      <div class="ledger-cell">
        <div class="lc-label">${t('balLabel')}</div>
        <div class="lc-val brand">${fmt(Math.max(0, b))}</div>
      </div>
    </div>

    <!-- PHOTO GALLERY -->
    ${photoTxns.length > 0 ? `
    <div class="sec-head" style="margin-top:0">${t('photosLbl')}</div>
    <div class="gallery-grid">
      ${photoTxns.slice(0, galleryExpanded ? photoTxns.length : 3).map(tx => `
        <img class="gallery-thumb" src="${tx.photo}"
          onclick="openPV('${tx.photo}', ${tx.amount}, '${esc(tx.desc || '')}', '${tx.date}')"/>
      `).join('')}
      ${!galleryExpanded && photoTxns.length > 3 ? `
        <div class="gallery-more-tile" onclick="expandGallery()">+${photoTxns.length - 3}</div>
      ` : ''}
    </div>` : ''}

    <!-- QUICK PAY -->
    ${!clear ? `
    <div class="method-toggle" style="margin-bottom:8px">
      <div class="method-opt ${qpMethod === 'cash' ? 'active' : ''}" onclick="setQpMethod('cash')">
        <span>💵</span> <span>${t('methodCash')}</span>
      </div>
      <div class="method-opt ${qpMethod === 'upi' ? 'active' : ''}" onclick="setQpMethod('upi')">
        <span>📱</span> <span>${t('methodUpi')}</span>
      </div>
    </div>
    ${qpMethod === 'upi' ? `
    <div class="qr-card">
      <img src="assets/upi-qr.png" alt="UPI QR"/>
      <div class="qr-hint">${t('qrHint')}</div>
    </div>` : ''}
    <div class="qp-bar">
      <input class="qp-input" id="qp-input" type="number" inputmode="decimal" placeholder="${t('payAmt')}"/>
      <button class="qp-full-btn" onclick="collectFull(${b})">${t('collectFull')}</button>
      <button class="qp-save-btn" onclick="quickPay()">${t('savePay2')}</button>
    </div>` : ''}

    <!-- WHATSAPP -->
    ${!clear ? `
    <a class="wa-btn" href="${waUrl(c.phone, c.name, b)}" target="_blank" rel="noopener">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      ${t('waBtn')}
    </a>
    <a class="sms-btn" href="${smsUrl(c.phone, c.name, b)}">
      📩 ${t('smsBtn')}
    </a>
    <div class="wa-fallback-hint">${t('waFallbackHint')}</div>` : ''}

    <!-- EDIT CUSTOMER -->
    <div style="margin-bottom:10px">
      <button class="ghost-btn" onclick="toggleEditCust()">✏️ ${t('editCustBtn')}</button>
    </div>

    ${editCustMode ? `
    <div class="edit-cust-section">
      <div class="ecs-row">
        <input id="ec-name" type="text" value="${c.name}" placeholder="${t('custName')}"/>
        <input id="ec-phone" type="tel" value="${c.phone}" placeholder="${t('custPhone')}"/>
      </div>
      <div class="ecs-actions">
        <button class="ecs-save" onclick="saveEditCust()">${t('saveEditBtn')}</button>
        <button class="ecs-del" onclick="startDelCust()">${t('delCustBtn')}</button>
      </div>
    </div>` : ''}

    ${delCustConf ? `
    <div class="confirm-strip">
      <span>${t('delCustQ')}</span>
      <div class="confirm-btns">
        <button class="confirm-yes" onclick="confirmDelCust()">${t('confirmYes')}</button>
        <button class="confirm-no" onclick="cancelDelCust()">${t('cancel')}</button>
      </div>
    </div>` : ''}

    <!-- TXN FILTER -->
    <div class="filter-row">
      <div class="filter-pill ${txnFilter === 'all'     ? 'active' : ''}" onclick="setTxnFilter('all')">${t('filterAll')}</div>
      <div class="filter-pill ${txnFilter === 'sale'    ? 'active' : ''}" onclick="setTxnFilter('sale')">${t('filterSale')}</div>
      <div class="filter-pill ${txnFilter === 'payment' ? 'active' : ''}" onclick="setTxnFilter('payment')">${t('filterPay')}</div>
    </div>

    <!-- DELETE TXN CONFIRM -->
    ${deletingTxnId ? `
    <div class="confirm-strip">
      <span>${t('delTxnQ')}</span>
      <div class="confirm-btns">
        <button class="confirm-yes" onclick="confirmDeleteTxn()">${t('confirmYes')}</button>
        <button class="confirm-no" onclick="cancelDeleteTxn()">${t('cancel')}</button>
      </div>
    </div>` : ''}

    <!-- TRANSACTIONS -->
    ${filtered.length === 0
      ? `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">${t('noTxn')}</div></div>`
      : filtered.map(tx => `
        <div class="txn-item">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="txn-icon ${tx.type}">${tx.type === 'sale' ? '🛍️' : '💰'}</div>
            <div class="txn-info">
              <div class="txn-label">${tx.type === 'sale' ? t('sale') : t('payment')}${tx.method ? ' · ' + t(tx.method === 'upi' ? 'upiTag' : 'cashTag') : ''}${tx.desc ? ' · ' + tx.desc : ''}</div>
              <div class="txn-sub">${fmtDate(tx.date)}</div>
            </div>
            <div class="txn-amount ${tx.type}">${tx.type === 'sale' ? '+' : '-'}${fmt(tx.amount)}</div>
          </div>
          ${tx.photo ? `<img class="txn-photo-thumb" src="${tx.photo}" onclick="openPV('${tx.photo}', ${tx.amount}, '${esc(tx.desc || '')}', '${tx.date}')"/>` : ''}
          <div class="txn-actions">
            ${tx.type === 'sale' ? `<button class="txn-action-btn bill" onclick="showBill('${tx.id}')">🧾 ${t('billBtn')}</button>` : ''}
            <button class="txn-action-btn edit" onclick="openEditModal('${tx.id}')">✏️ ${t('editEntry')}</button>
            <button class="txn-action-btn delete" onclick="startDeleteTxn('${tx.id}')">🗑 ${lang === 'hi' ? 'हटाएँ' : 'Delete'}</button>
          </div>
        </div>`).join('')
    }
  `;
}
