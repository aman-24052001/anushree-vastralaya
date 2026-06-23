/* js/forms.js — Sale form, Payment form, dropdown logic */

let saleItemsState = [{ desc: '', amount: '', photo: null }];
let editPhotoData  = null;
let payMethod       = 'cash';

function setPayMethod(m) {
  payMethod = m;
  document.getElementById('p-method-cash').classList.toggle('active', m === 'cash');
  document.getElementById('p-method-upi').classList.toggle('active', m === 'upi');
  document.getElementById('p-qr-card').style.display = m === 'upi' ? 'block' : 'none';
}

// ── GENERIC CUSTOMER DROPDOWN ────────────────────────────────────────────────
function buildDropdown(inputId, dropId, onPickFn) {
  const q    = (document.getElementById(inputId).value || '').toLowerCase();
  const list = customers.filter(c => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q));
  const dd   = document.getElementById(dropId);

  if (!list.length) { dd.classList.remove('open'); return; }

  dd.innerHTML = list.map(c => `
    <div class="drop-item" onclick="(${onPickFn.toString()})('${esc(c.id)}','${esc(c.name)}')">
      <div class="drop-av">${c.photo ? `<img src="${c.photo}"/>` : initial(c.name)}</div>
      <span>${c.name}</span>
      <span class="drop-phone">${c.phone}</span>
    </div>`).join('');
  dd.classList.add('open');
}

// Close dropdowns on outside click
document.addEventListener('click', e => {
  ['sale-drop', 'pay-drop'].forEach(id => {
    const dd  = document.getElementById(id);
    const inp = id === 'sale-drop' ? 'sc-input' : 'pc-input';
    if (dd && !dd.contains(e.target) && e.target.id !== inp)
      dd.classList.remove('open');
  });
});

// ── SALE FORM ────────────────────────────────────────────────────────────────
function openSaleDrop()   { buildDropdown('sc-input', 'sale-drop', pickSaleCust); }
function filterSaleDrop() { document.getElementById('sc-id').value = ''; buildDropdown('sc-input', 'sale-drop', pickSaleCust); }
function pickSaleCust(id, name) {
  document.getElementById('sc-id').value    = id;
  document.getElementById('sc-input').value = name;
  document.getElementById('sale-drop').classList.remove('open');
}

function handleSaleItemPhoto(e, idx) {
  const file = e.target.files[0]; if (!file) return;
  compressPhoto(file, data => {
    saleItemsState[idx].photo = data;
    const prev = document.getElementById('si-photo-prev-' + idx);
    if (prev) { prev.src = data; prev.style.display = 'block'; }
  });
}

function renderSaleItemRows() {
  document.getElementById('sale-items-list').innerHTML = saleItemsState.map((item, i) => `
    <div class="sale-item-row">
      <div class="sale-item-row-head">
        <span class="sale-item-num">${t('itemNum')} ${i + 1}</span>
        ${saleItemsState.length > 1 ? `<button class="sale-item-remove" onclick="removeSaleItemRow(${i})">✕</button>` : ''}
      </div>
      <div class="f-group">
        <input class="f-input" id="si-desc-${i}" type="text" placeholder="${t('itemDescPH')}"
          value="${esc(item.desc)}" oninput="saleItemsState[${i}].desc = this.value"/>
      </div>
      <div class="f-group">
        <input class="f-input amount" id="si-amt-${i}" type="number" inputmode="decimal" placeholder="${t('itemAmtPH')}"
          value="${item.amount || ''}" oninput="saleItemsState[${i}].amount = this.value; updateSaleTotal()"/>
      </div>
      <input type="file" id="si-photo-file-${i}" accept="image/*"
        style="display:none" onchange="handleSaleItemPhoto(event, ${i})"/>
      <button class="photo-upload-btn" onclick="document.getElementById('si-photo-file-${i}').click()">
        ${t('takePhoto')}
      </button>
      <img class="photo-preview-img" id="si-photo-prev-${i}" src="${item.photo || ''}" style="${item.photo ? '' : 'display:none'}"/>
    </div>`).join('');
}

function addSaleItemRow() {
  saleItemsState.push({ desc: '', amount: '', photo: null });
  renderSaleItemRows();
}
function removeSaleItemRow(idx) {
  if (saleItemsState.length <= 1) return;
  saleItemsState.splice(idx, 1);
  renderSaleItemRows();
  updateSaleTotal();
}
function updateSaleTotal() {
  const total = saleItemsState.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);
  document.getElementById('sale-total-amt').textContent = fmt(total);
}

function resetSaleForm() {
  document.getElementById('sc-input').value = '';
  document.getElementById('sc-id').value = '';
  document.getElementById('sale-drop').classList.remove('open');
  saleItemsState = [{ desc: '', amount: '', photo: null }];
  renderSaleItemRows();
  updateSaleTotal();
  document.getElementById('sale-recent').innerHTML = recentTrayHTML('pickSaleCust');
}

async function saveSale() {
  const custId = document.getElementById('sc-id').value;
  if (!custId) { toast(t('t_fillSale')); return; }

  const items = saleItemsState
    .map(it => ({ desc: (it.desc || '').trim(), amount: parseFloat(it.amount), photo: it.photo || null }))
    .filter(it => it.amount > 0); // silently drops any extra rows left empty

  if (!items.length) { toast(t('t_fillSale')); return; }

  const total = items.reduce((s, it) => s + it.amount, 0);
  const desc  = items.length === 1
    ? items[0].desc
    : items.length === 2
      ? items.map(it => it.desc).filter(Boolean).join(', ')
      : `${items[0].desc || t('itemNum') + ' 1'} +${items.length - 1} ${t('moreItems')}`;

  const tx = {
    id: uid(), customerId: custId, type: 'sale',
    items, amount: total, desc, photo: items[0].photo || null,
    date: new Date().toISOString(),
  };
  await dbPut('transactions', tx);
  transactions.push(tx);
  toast(t('t_sale'));
  resetSaleForm();
  goTo('home');
}

// ── PAYMENT FORM ─────────────────────────────────────────────────────────────
function openPayDrop()   { buildDropdown('pc-input', 'pay-drop', pickPayCust); }
function filterPayDrop() { document.getElementById('pc-id').value = ''; buildDropdown('pc-input', 'pay-drop', pickPayCust); }
function pickPayCust(id, name) {
  document.getElementById('pc-id').value    = id;
  document.getElementById('pc-input').value = name;
  document.getElementById('pay-drop').classList.remove('open');

  const b     = bal(id);
  const strip = document.getElementById('pay-bal-strip');
  if (b > 0) { strip.textContent = t('curBal') + ': ' + fmt(b); strip.style.display = 'block'; }
  else        { strip.style.display = 'none'; }
}

function resetPayForm() {
  ['pc-input', 'p-amt', 'p-note'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('pc-id').value = '';
  document.getElementById('pay-drop').classList.remove('open');
  document.getElementById('pay-bal-strip').style.display = 'none';
  document.getElementById('pay-recent').innerHTML = recentTrayHTML('pickPayCust');
  wireLivePreview('p-amt', 'p-amt-preview');
  setPayMethod('cash');
}

async function savePayment() {
  const custId = document.getElementById('pc-id').value;
  const amt    = parseFloat(document.getElementById('p-amt').value);
  const note   = document.getElementById('p-note').value.trim();
  if (!custId || !amt || amt <= 0) { toast(t('t_fillPay')); return; }

  const tx = { id: uid(), customerId: custId, type: 'payment', amount: amt, desc: note, photo: null, method: payMethod, date: new Date().toISOString() };
  await dbPut('transactions', tx);
  transactions.push(tx);
  toast(t('t_pay'));
  resetPayForm();
  goTo('home');
}

// ── EDIT TXN MODAL ───────────────────────────────────────────────────────────
function openEditModal(id) {
  const tx = transactions.find(x => x.id === id); if (!tx) return;
  document.getElementById('edit-txn-id').value = id;
  document.getElementById('e-amt').value        = tx.amount;
  document.getElementById('e-desc').value       = tx.desc || '';
  document.getElementById('e-date').value       = tx.date.split('T')[0];
  document.getElementById('e-ph-prev').style.display = 'none';
  document.getElementById('e-ph-file').value    = '';
  editPhotoData = null;
  document.getElementById('edit-modal').classList.add('open');
}
function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('open');
  editPhotoData = null;
}
function handleEditPhoto(e) {
  const file = e.target.files[0]; if (!file) return;
  compressPhoto(file, data => {
    editPhotoData = data;
    const prev = document.getElementById('e-ph-prev');
    prev.src = data; prev.style.display = 'block';
  });
}
async function saveEdit() {
  const id  = document.getElementById('edit-txn-id').value;
  const tx  = transactions.find(x => x.id === id); if (!tx) return;
  const amt = parseFloat(document.getElementById('e-amt').value);
  const desc = document.getElementById('e-desc').value.trim();
  const date = document.getElementById('e-date').value;
  if (!amt || amt <= 0) return;

  tx.amount = amt; tx.desc = desc; tx.date = toISO(date);
  if (editPhotoData) tx.photo = editPhotoData;
  await dbPut('transactions', tx);
  toast(t('t_txnEdit'));
  closeEditModal();
  renderDetail();
}
