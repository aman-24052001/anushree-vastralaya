/* js/forms.js — Sale form, Payment form, dropdown logic */

let salePhotoData  = null;
let editPhotoData  = null;

// ── GENERIC CUSTOMER DROPDOWN ────────────────────────────────────────────────
function buildDropdown(inputId, dropId, onPickFn) {
  const q    = (document.getElementById(inputId).value || '').toLowerCase();
  const list = customers.filter(c => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q));
  const dd   = document.getElementById(dropId);

  if (!list.length) { dd.classList.remove('open'); return; }

  dd.innerHTML = list.map(c => `
    <div class="drop-item" onclick="(${onPickFn.toString()})('${c.id}','${c.name.replace(/'/g,"\\'")}')">
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

function handleSalePhoto(e) {
  const file = e.target.files[0]; if (!file) return;
  compressPhoto(file, data => {
    salePhotoData = data;
    const prev = document.getElementById('ph-prev');
    prev.src = data; prev.style.display = 'block';
  });
}

function resetSaleForm() {
  ['sc-input', 's-amt', 's-desc'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('sc-id').value = '';
  document.getElementById('ph-prev').style.display = 'none';
  document.getElementById('ph-file').value = '';
  document.getElementById('sale-drop').classList.remove('open');
  salePhotoData = null;
}

async function saveSale() {
  const custId = document.getElementById('sc-id').value;
  const amt    = parseFloat(document.getElementById('s-amt').value);
  const desc   = document.getElementById('s-desc').value.trim();
  if (!custId || !amt || amt <= 0) { toast(t('t_fillSale')); return; }

  const tx = { id: uid(), customerId: custId, type: 'sale', amount: amt, desc, photo: salePhotoData || null, date: new Date().toISOString() };
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
}

async function savePayment() {
  const custId = document.getElementById('pc-id').value;
  const amt    = parseFloat(document.getElementById('p-amt').value);
  const note   = document.getElementById('p-note').value.trim();
  if (!custId || !amt || amt <= 0) { toast(t('t_fillPay')); return; }

  const tx = { id: uid(), customerId: custId, type: 'payment', amount: amt, desc: note, photo: null, date: new Date().toISOString() };
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
