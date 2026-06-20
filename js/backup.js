/* js/backup.js — export/restore to a real file in Downloads (survives "clear browsing data") */

function exportBackup() {
  const data = {
    app: 'anushree-vastralaya',
    version: 1,
    exportedAt: new Date().toISOString(),
    customers,
    transactions,
  };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `anushree-vastralaya-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);

  localStorage.setItem('av_last_backup', Date.now().toString());
  toast(t('backupSaved'));
  if (typeof renderHome === 'function') renderHome();
}

function triggerImportPicker() {
  document.getElementById('backup-file-input').click();
}

function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async ev => {
    let data;
    try { data = JSON.parse(ev.target.result); } catch (err) { toast(t('backupInvalid')); return; }

    if (!data || !Array.isArray(data.customers) || !Array.isArray(data.transactions)) {
      toast(t('backupInvalid'));
      return;
    }
    if (!confirm(t('importConfirm'))) return;

    try {
      await dbClear('customers');
      await dbClear('transactions');
      for (const c of data.customers)   await dbPut('customers', c);
      for (const tx of data.transactions) await dbPut('transactions', tx);
    } catch (err) {
      toast(t('backupInvalid'));
      return;
    }

    await loadData();
    renderAll();
    localStorage.setItem('av_last_backup', Date.now().toString());
    toast(t('backupRestored'));
    closeSettings();
  };
  reader.onerror = () => toast(t('backupInvalid'));
  reader.readAsText(file);
  e.target.value = ''; // allow re-picking the same filename later
}

// Home-screen nudge — shown only when there's data worth losing and no recent backup exists
function backupReminderHTML() {
  const hasData = customers.length > 0 || transactions.length > 0;
  if (!hasData) return '';
  const last = localStorage.getItem('av_last_backup');
  const staleMs = 14 * 24 * 60 * 60 * 1000;
  const stale = !last || (Date.now() - parseInt(last, 10) > staleMs);
  if (!stale) return '';
  return `
    <div class="backup-banner" onclick="openSettings()">
      <span class="backup-banner-icon">💾</span>
      <span class="backup-banner-text">${t('backupReminder')}</span>
      <span class="backup-banner-arrow">›</span>
    </div>`;
}
