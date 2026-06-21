/* js/bill.js — simple shareable bill per sale (itemized, real PDF, faint logo watermark) */

let currentBillText = '';
let currentBillData = null;

// jsPDF's built-in fonts use WinAnsi encoding, which has no ₹ glyph — it renders as
// garbage. "Rs." is the standard workaround real invoicing tools use in PDF text.
// The on-screen HTML bill keeps using ₹ via fmt() since browsers render it fine there.
const pdfFmt = n => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

function loadImageEl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function showBill(txnId) {
  const tx = transactions.find(x => x.id === txnId);
  if (!tx) return;
  const c = customers.find(x => x.id === tx.customerId);
  const shopName = lang === 'hi' ? 'अनुश्री वस्त्रालय' : 'Anushree Vastralaya';
  const tagline  = 'Sarees · Textiles · Traditions';
  const dateStr  = new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const items    = saleItems(tx);

  currentBillData = { shopName, tagline, customerName: c ? c.name : '—', dateStr, items, totalRaw: tx.amount };

  document.getElementById('bill-body').innerHTML = `
    <div class="bill-shop">${shopName}</div>
    <div class="bill-tagline">${tagline}</div>
    <div class="bill-divider"></div>
    <div class="bill-row"><span>${t('billCustomer')}</span><b>${currentBillData.customerName}</b></div>
    <div class="bill-row"><span>${t('billDate')}</span><b>${dateStr}</b></div>
    <div class="bill-divider"></div>
    ${items.map(it => `<div class="bill-row"><span>${it.desc || t('itemNum')}</span><b>${fmt(it.amount)}</b></div>`).join('')}
    <div class="bill-divider"></div>
    <div class="bill-amount-row"><span>${t('billAmount')}</span><span class="bill-amount">${fmt(tx.amount)}</span></div>
    <div class="bill-divider"></div>
    <div class="bill-thanks">${t('billThanks')}</div>
  `;

  currentBillText =
`${shopName}
${tagline}
------------------------
${t('billCustomer')} ${currentBillData.customerName}
${t('billDate')} ${dateStr}
------------------------
${items.map(it => `${it.desc || t('itemNum')}: ${fmt(it.amount)}`).join('\n')}
------------------------
${t('billAmount')} ${fmt(tx.amount)}
------------------------
${t('billThanks')}`;

  document.getElementById('bill-modal').classList.add('open');
}

function closeBill() {
  document.getElementById('bill-modal').classList.remove('open');
}

// A5 — a standard recognized page size, so generic PDF viewers (Drive, Play Books,
// WhatsApp's preview, etc.) render it predictably instead of guessing at a custom
// thermal-receipt-sized page.
async function buildBillPDF() {
  if (typeof jspdf === 'undefined' || !currentBillData) return null;
  const { jsPDF } = jspdf;
  const d = currentBillData;
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  const pageW = 148, marginX = 18;
  const cx = pageW / 2, lx = marginX, rx = pageW - marginX;

  // Faint logo watermark, drawn first so all text sits above it
  try {
    const logo = await loadImageEl('assets/watermark-peacock.png');
    const wm = 95;
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.09 }));
    doc.addImage(logo, 'PNG', cx - wm / 2, 68, wm, wm);
    doc.restoreGraphicsState();
  } catch (err) {
    // logo failed to load for any reason — bill still generates fine without the watermark
  }

  let y = 28;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text(d.shopName, cx, y, { align: 'center' });
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(d.tagline, cx, y, { align: 'center' });
  y += 6;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(lx, y, rx, y);
  y += 11;

  doc.setFontSize(12);
  const row = (label, value, bold) => {
    doc.setFont('helvetica', 'normal');
    doc.text(String(label), lx, y);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(String(value), rx, y, { align: 'right' });
    y += 8;
  };
  row(t('billCustomer'), d.customerName);
  row(t('billDate'), d.dateStr);

  y += 2;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(lx, y, rx, y);
  y += 11;

  d.items.forEach(it => row(it.desc || t('itemNum'), pdfFmt(it.amount), true));

  y += 2;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(lx, y, rx, y);
  y += 13;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(t('billAmount'), lx, y);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(pdfFmt(d.totalRaw), rx, y, { align: 'right' });
  y += 11;

  doc.setLineDashPattern([1, 1], 0);
  doc.line(lx, y, rx, y);
  y += 13;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(t('billThanks'), cx, y, { align: 'center' });

  return doc;
}

async function shareBill() {
  let doc = null;
  try { doc = await buildBillPDF(); } catch (err) { doc = null; }

  if (doc) {
    try {
      const blob = doc.output('blob');
      const file = new File([blob], 'bill.pdf', { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
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
