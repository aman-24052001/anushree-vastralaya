/* js/app.js — Navigation controller and boot */

let curTab = 'home';

function goTo(tab) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + tab).classList.add('active');
  document.getElementById('nav-' + tab).classList.add('active');
  curTab = tab;

  if (tab === 'home')      renderHome();
  if (tab === 'customers') renderCustomers();
  if (tab === 'add')       { resetSaleForm();  buildDropdown('sc-input', 'sale-drop', pickSaleCust); }
  if (tab === 'pay')       { resetPayForm();   buildDropdown('pc-input', 'pay-drop',  pickPayCust);  }
}

function renderAll() {
  if (curTab === 'home')      renderHome();
  if (curTab === 'customers') renderCustomers();
}

// Boot
initDB()
  .then(loadData)
  .then(() => {
    applyStaticLabels();
    renderHome();
    checkFirstRun();
    autoBackupCheck();
  })
  .catch(err => {
    document.body.innerHTML = `
      <div style="padding:40px;text-align:center;color:#EF4444;font-family:sans-serif">
        <div style="font-size:40px;margin-bottom:12px">⚠️</div>
        <div style="font-size:16px;font-weight:700;margin-bottom:8px">App failed to load</div>
        <div style="font-size:13px;color:#666">${err.message}</div>
        <button onclick="location.reload()" style="margin-top:16px;padding:10px 20px;background:#C2185B;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer">
          Retry
        </button>
      </div>`;
  });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
  // sw.js calls skipWaiting()+clients.claim() on every deploy, so a new version takes
  // control automatically — but the already-loaded page only reflects it after a reload.
  // Do that reload automatically, once, instead of relying on a manual close-and-reopen.
  let swRefreshed = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (swRefreshed) return;
    swRefreshed = true;
    window.location.reload();
  });
}
