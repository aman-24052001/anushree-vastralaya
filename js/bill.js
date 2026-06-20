/* js/bill.js — simple shareable bill per sale (now as a real PDF, not just text) */

let currentBillText = '';
let currentBillData = null;

function showBill(txnId) {
  const tx = transactions.find(x => x.id === txnId);
  if (!tx) return;
  const c = customers.find(x => x.id === tx.customerId);
  const shopName = lang === 'hi' ? 'अनुश्री वस्त्रालय' : 'Anushree Vastralaya';
  const tagline  = 'Sarees · Textiles · Traditions';
  const dateStr  = new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  currentBillData = { shopName, tagline, customerName: c ? c.name : '—', dateStr, desc: tx.desc || '', amountFmt: fmt(tx.amount) };

  document.getElementById('bill-body').innerHTML = `
    <div class="bill-shop">${shopName}</div>
    <div class="bill-tagline">${tagline}</div>
    <div class="bill-divider"></div>
    <div class="bill-row"><span>${t('billCustomer')}</span><b>${currentBillData.customerName}</b></div>
    <div class="bill-row"><span>${t('billDate')}</span><b>${dateStr}</b></div>
    ${tx.desc ? `<div class="bill-row"><span>${t('billItem')}</span><b>${tx.desc}</b></div>` : ''}
    <div class="bill-divider"></div>
    <div class="bill-amount-row"><span>${t('billAmount')}</span><span class="bill-amount">${fmt(tx.amount)}</span></div>
    <div class="bill-divider"></div>
    <div class="bill-thanks">${t('billThanks')}</div>
  `;

  // Plain-text fallback — used only if PDF generation or file-sharing isn't available
  currentBillText =
`${shopName}
${tagline}
------------------------
${t('billCustomer')} ${currentBillData.customerName}
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

// Build a small one-page PDF from currentBillData using the vendored jsPDF
function buildBillPDF() {
  if (typeof jspdf === 'undefined' || !currentBillData) return null;
  const { jsPDF } = jspdf;
  const doc = new jsPDF({ unit: 'mm', format: [80, 120] }); // narrow receipt-style page
  const d = currentBillData;
  const cx = 40; // horizontal center of an 80mm-wide page
  let y = 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(d.shopName, cx, y, { align: 'center' });
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(d.tagline, cx, y, { align: 'center' });
  y += 4;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(6, y, 74, y);
  y += 7;

  doc.setFontSize(10);
  const row = (label, value) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, 6, y);
    doc.setFont('helvetica', 'bold');
    doc.text(String(value), 74, y, { align: 'right' });
    y += 6;
  };
  row(t('billCustomer'), d.customerName);
  row(t('billDate'), d.dateStr);
  if (d.desc) row(t('billItem'), d.desc);

  y += 1;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(6, y, 74, y);
  y += 9;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(t('billAmount'), 6, y);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(d.amountFmt, 74, y, { align: 'right' });
  y += 8;

  doc.setLineDashPattern([1, 1], 0);
  doc.line(6, y, 74, y);
  y += 8;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(t('billThanks'), cx, y, { align: 'center' });

  return doc;
}

async function shareBill() {
  const doc = buildBillPDF();

  if (doc) {
    try {
      const blob = doc.output('blob');
      const file = new File([blob], 'bill.pdf', { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
      // Can't share a file directly — fall back to downloading the PDF so it can be
      // attached manually (e.g. via WhatsApp's own file picker) from Downloads.
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bill-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast(t('billPdfSaved'));
      return;
    } catch (err) {
      // fall through to text sharing below
    }
  }

  if (navigator.share) {
    try { await navigator.share({ text: currentBillText }); return; }
    catch (err) { return; }
  }
  try {
    await navigator.clipboard.writeText(currentBillText);
    toast(t('billCopied'));
  } catch (err) {
    toast(t('billCopyFailed'));
  }
}
