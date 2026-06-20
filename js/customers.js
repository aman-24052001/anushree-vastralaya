/* js/customers.js — Customers page */

async function addCustomer() {
  const name  = document.getElementById('nc-name').value.trim();
  const phone = document.getElementById('nc-phone').value.trim();
  if (!name || !phone) { toast(t('t_fillCust')); return; }
  const c = { id: uid(), name, phone, photo: null, createdAt: new Date().toISOString() };
  await dbPut('customers', c);
  customers.push(c);
  document.getElementById('nc-name').value = '';
  document.getElementById('nc-phone').value = '';
  toast(t('t_custAdd'));
  renderCustomers();
}

function renderCustomers() {
  const q = (document.getElementById('search').value || '').toLowerCase();
  const list = customers
    .filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q))
    .map(c => ({ ...c, b: bal(c.id) }))
    .sort((a, z) => z.b - a.b);

  if (!list.length) {
    document.getElementById('cust-list').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🪷</div>
        <div class="empty-title">${t('noCustomers')}</div>
        <div class="empty-sub">${t('noCustomersSub')}</div>
      </div>`;
    return;
  }

  document.getElementById('cust-list').innerHTML = list.map(c => {
    const ag    = agingText(c.id);
    const agCls = agingClass(c.id);
    return `
    <div class="cust-card" onclick="openDetail('${esc(c.id)}')">
      ${avatarHTML(c)}
      <div class="ci">
        <div class="ci-name">${c.name}</div>
        <div class="ci-bal ${c.b > 0 ? 'red' : 'green'}">
          ${c.b > 0 ? fmt(c.b) + ' ' + t('owing') : t('allClear')}
        </div>
        <div class="ci-meta">${c.phone}</div>
        ${ag ? `<div class="aging-pill ${agCls}">${ag}</div>` : ''}
      </div>
      <a class="call-fab icon-label-btn" href="tel:${c.phone}" onclick="event.stopPropagation()" aria-label="${t('call')}">📞 ${t('call')}</a>
    </div>`;
  }).join('');
}
