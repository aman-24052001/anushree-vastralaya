/* js/bill.js — simple shareable bill per sale */

let currentBillText = '';

function showBill(txnId) {
  const tx = transactions.find(x => x.id === txnId);
  if (!tx) return;
  const c = customers.find(x => x.id === tx.customerId);
  const shopName = lang === 'hi' ? 'अनुश्री वस्त्रालय' : 'Anushree Vastralaya';
  const tagline  = 'Sarees · Textiles · Traditions';
  const dateStr  = new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  document.getElementById('bill-body').innerHTML = `
    <div class="bill-shop">${shopName}</div>
    <div class="bill-tagline">${tagline}</div>
    <div class="bill-divider"></div>
    <div class="bill-row"><span>${t('billCustomer')}</span><b>${c ? c.name : '—'}</b></div>
    <div class="bill-row"><span>${t('billDate')}</span><b>${dateStr}</b></div>
    ${tx.desc ? `<div class="bill-row"><span>${t('billItem')}</span><b>${tx.desc}</b></div>` : ''}
    <div class="bill-divider"></div>
    <div class="bill-amount-row"><span>${t('billAmount')}</span><span class="bill-amount">${fmt(tx.amount)}</span></div>
    <div class="bill-divider"></div>
    <div class="bill-thanks">${t('billThanks')}</div>
  `;

  // Plain-text version for sharing/copying — works everywhere, no image rendering needed
  currentBillText =
`${shopName}
${tagline}
------------------------
${t('billCustomer')} ${c ? c.name : '—'}
${t('billDate')} ${dateStr}
${tx.desc ? t('billItem') + ' ' + tx.desc + '\n' : ''}------------------------
${t('billAmount')} ${fmt(tx.amount)}
------------------------
${t('billThanks')}`;

  document.getElementById('bill-modal').classList.add('open');
}

function closeBill() {
  document.getElementById('bill-modal').classList.remove('open');
}

async function shareBill() {
  if (navigator.share) {
    try {
      await navigator.share({ text: currentBillText });
      return;
    } catch (err) {
      return; // user cancelled the share sheet — not an error
    }
  }
  // Fallback for browsers without Web Share — copy to clipboard instead
  try {
    await navigator.clipboard.writeText(currentBillText);
    toast(t('billCopied'));
  } catch (err) {
    toast(t('billCopyFailed'));
  }
}
