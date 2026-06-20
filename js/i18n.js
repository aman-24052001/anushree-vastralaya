/* js/i18n.js — Hindi / English strings */

let lang = localStorage.getItem('av_lang') || 'hi';

const L = {
  hi: {
    appName: 'अनुश्री वस्त्रालय', appSub: 'साड़ी · टेक्सटाइल्स · परंपरा',
    home: 'घर', customers: 'ग्राहक', addSale: 'बिक्री', addPay: 'भुगतान',
    totalDue: 'कुल बकाया', subDue: 'सभी ग्राहकों का',
    custOwing: 'ग्राहक बकाया', collectedLabel: 'वसूल',
    monthSale: 'इस महीने', allTime: 'कुल बिक्री',
    topDebtors: '⚠ सबसे ज़्यादा बकाया', recentSales: 'हाल की बिक्री',
    months: ['जन','फ़र','मार','अप्र','मई','जून','जुल','अग','सित','अक्त','नव','दिस'],
    chartTitle: 'महीनेवार बिक्री', pieTitle: 'इस महीने का हिसाब',
    collected: 'वसूल', owing: 'बकाया',
    addCustTitle: 'नया ग्राहक जोड़ें',
    custName: 'नाम', custPhone: 'फोन नंबर', addCustBtn: 'जोड़ें',
    searchPH: 'नाम या फोन से खोजें...',
    noCustomers: 'कोई ग्राहक नहीं।', noCustomersSub: 'ऊपर नाम और फोन डालकर जोड़ें।',
    selCust: 'ग्राहक चुनें', selCustPH: 'नाम लिखें...',
    amtLbl: 'राशि (₹)', descLbl: 'विवरण', descPH: 'जैसे: लाल बनारसी साड़ी',
    photoLbl: 'फ़ोटो', takePhoto: '📷  फ़ोटो लें', saveSale: 'बिक्री दर्ज करें',
    payCust: 'ग्राहक चुनें', payAmt: 'भुगतान राशि (₹)',
    payNote: 'नोट', payNotePH: 'जैसे: कैश मिला', savePay: 'भुगतान दर्ज करें',
    curBal: 'वर्तमान बकाया',
    balance: 'बकाया राशि', allClear: '✓ सब चुकता',
    call: 'कॉल', sale: 'बिक्री', payment: 'भुगतान',
    noTxn: 'कोई लेन-देन नहीं।',
    filterAll: 'सभी', filterSale: 'बिक्री', filterPay: 'भुगतान',
    purchases: 'कुल खरीद', paid: 'कुल भुगतान', balLabel: 'बकाया',
    editCustBtn: '✏️  ग्राहक सुधारें', delCustBtn: '🗑  हटाएँ',
    saveEditBtn: 'सेव करें',
    delCustQ: 'ग्राहक हटाएँ?', delTxnQ: 'एंट्री हटाएँ?',
    confirmYes: 'हाँ, हटाएँ', cancel: 'रद्द',
    editEntry: 'एंट्री सुधारें', editDate: 'तारीख',
    changePhoto: '📷  फ़ोटो बदलें', saveEntryBtn: '✓ सुधार सेव करें',
    collectFull: '✓ पूरा', savePay2: 'दर्ज',
    waBtn: 'WhatsApp पर याद दिलाएँ',
    waMsg: (name, amt, shop) => `नमस्ते ${name} जी,\n\nआपका बकाया भुगतान ₹${amt} है।\nकृपया जल्द भुगतान करें।\n\nधन्यवाद,\n${shop}`,
    agingDays: d => `${d} दिन से बकाया`,
    agingLastPay: d => `आखिरी भुगतान ${d} दिन पहले`,
    noSales: 'अभी कोई बिक्री नहीं',
    t_sale: '✓ बिक्री दर्ज', t_pay: '✓ भुगतान दर्ज',
    t_custAdd: '✓ ग्राहक जोड़ा', t_custEdit: '✓ ग्राहक सुधरा',
    t_txnEdit: '✓ एंट्री सुधरी', t_txnDel: '✓ एंट्री हटाई',
    t_custDel: '✓ ग्राहक हटाया',
    t_fillSale: 'ग्राहक और राशि भरें',
    t_fillPay: 'ग्राहक और राशि भरें',
    t_fillCust: 'नाम और फोन भरें',
    settings: 'सेटिंग्स', appearance: 'दिखावट', themeLbl: 'थीम',
    themeDefault: 'डिफ़ॉल्ट', themeNeo: 'नियो-ब्रूटल', themeBauhaus: 'बाउहॉस',
    textSizeLbl: 'टेक्स्ट साइज़', sizeSmall: 'छोटा', sizeNormal: 'सामान्य', sizeLarge: 'बड़ा',
    recentCust: 'हाल के ग्राहक',
    todayActivity: 'आज की गतिविधि', noActivityToday: 'आज अभी कुछ नहीं हुआ',
    photosLbl: 'फ़ोटो',
    undoBtn: 'पूर्ववत करें',
    t_custDelUndo: 'ग्राहक हटाया गया', t_txnDelUndo: 'एंट्री हटाई गई',
    soldFor: 'की बिक्री', paidLbl2: 'का भुगतान मिला',
    appGuide: 'ऐप गाइड', appGuideSub: 'सभी फीचर फिर से देखें',
    tourNext: 'आगे', tourBack: 'पीछे', tourSkip: 'छोड़ें', tourDone: 'समाप्त',
    payMethod: 'भुगतान का तरीका', methodCash: 'नकद', methodUpi: 'यूपीआई',
    qrHint: 'ग्राहक को यह दिखाएँ — वह स्कैन करके भुगतान करेगा',
    cashTag: '💵 नकद', upiTag: '📱 यूपीआई',
    backupSection: 'बैकअप और रीस्टोर',
    exportBackup: 'बैकअप सेव करें', exportBackupSub: 'सारा डेटा एक फ़ाइल में डाउनलोड फ़ोल्डर में सेव करें',
    importBackup: 'बैकअप से वापस लाएँ', importBackupSub: 'पुरानी बैकअप फ़ाइल से डेटा वापस लाएँ',
    importConfirm: 'यह अभी का सारा डेटा बदल देगा। जारी रखें?',
    backupSaved: 'बैकअप डाउनलोड फ़ोल्डर में सेव हो गया',
    backupRestored: 'बैकअप वापस आ गया',
    backupInvalid: 'यह सही बैकअप फ़ाइल नहीं है',
    backupReminder: 'सलाह: काफी समय से बैकअप नहीं लिया — डेटा सुरक्षित रखने के लिए अभी ले लें',
    autoBackupSaved: 'ऑटो-बैकअप डाउनलोड फ़ोल्डर में सेव हुआ',
    importContacts: 'फ़ोन से चुनें', contactsNotSupported: 'यह ब्राउज़र इसका समर्थन नहीं करता — नाम-फोन खुद लिखें',
    smsBtn: 'SMS भेजें', waFallbackHint: 'अगर नंबर WhatsApp पर नहीं है, तो ऊपर SMS भेजें',
    installPrompt: 'इस ऐप को होम स्क्रीन पर जोड़ें — आइकन से सीधे खोलें',
    installManualHint: "इंस्टॉल करने के लिए: ऊपर ⋮ (तीन डॉट) दबाएँ → 'Add to Home screen' या 'Install app' चुनें",
    billBtn: 'बिल', billTitle: 'बिल', billCustomer: 'ग्राहक:', billDate: 'तारीख:', billItem: 'सामान:',
    billAmount: 'राशि:', billThanks: 'हमारे यहाँ खरीदारी के लिए धन्यवाद!', billShareBtn: '📤 शेयर करें',
    billCopied: 'बिल कॉपी हो गया', billCopyFailed: 'शेयर नहीं हो पाया',
    billPdfSaved: 'बिल PDF डाउनलोड फ़ोल्डर में सेव हुआ',
    addItemBtn: 'और सामान जोड़ें', totalLbl: 'कुल राशि', itemNum: 'सामान',
    itemDescPH: 'जैसे: लाल बनारसी साड़ी', itemAmtPH: 'राशि (₹)', moreItems: 'और',
  },
  en: {
    appName: 'Anushree Vastralaya', appSub: 'Sarees · Textiles · Traditions',
    home: 'Home', customers: 'Customers', addSale: 'Sale', addPay: 'Payment',
    totalDue: 'Total Outstanding', subDue: 'Across all customers',
    custOwing: 'customers owing', collectedLabel: 'collected',
    monthSale: 'This Month', allTime: 'All Time',
    topDebtors: '⚠ Top Debtors', recentSales: 'Recent Sales',
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    chartTitle: 'Monthly Sales', pieTitle: 'This Month Breakdown',
    collected: 'Collected', owing: 'Owing',
    addCustTitle: 'Add New Customer',
    custName: 'Name', custPhone: 'Phone', addCustBtn: 'Add',
    searchPH: 'Search by name or phone...',
    noCustomers: 'No customers yet.', noCustomersSub: 'Add name and phone above.',
    selCust: 'Select Customer', selCustPH: 'Type a name...',
    amtLbl: 'Amount (₹)', descLbl: 'Description', descPH: 'e.g. Red Banarasi Saree',
    photoLbl: 'Photo', takePhoto: '📷  Take Photo', saveSale: 'Add Sale',
    payCust: 'Select Customer', payAmt: 'Payment Amount (₹)',
    payNote: 'Note', payNotePH: 'e.g. Cash received', savePay: 'Record Payment',
    curBal: 'Current Balance',
    balance: 'Balance Due', allClear: '✓ All Clear',
    call: 'Call', sale: 'Sale', payment: 'Payment',
    noTxn: 'No transactions yet.',
    filterAll: 'All', filterSale: 'Sales', filterPay: 'Payments',
    purchases: 'Purchases', paid: 'Paid', balLabel: 'Balance',
    editCustBtn: '✏️  Edit Customer', delCustBtn: '🗑  Delete',
    saveEditBtn: 'Save',
    delCustQ: 'Delete customer?', delTxnQ: 'Delete this entry?',
    confirmYes: 'Yes, Delete', cancel: 'Cancel',
    editEntry: 'Edit Entry', editDate: 'Date',
    changePhoto: '📷  Change Photo', saveEntryBtn: '✓ Save Changes',
    collectFull: '✓ Full', savePay2: 'Save',
    waBtn: 'Send WhatsApp Reminder',
    waMsg: (name, amt, shop) => `Namaste ${name} ji,\n\nYour outstanding balance is ₹${amt}.\nKindly make the payment at your earliest convenience.\n\nThank you,\n${shop}`,
    agingDays: d => `Owing for ${d} days`,
    agingLastPay: d => `Last payment ${d} days ago`,
    noSales: 'No sales yet',
    t_sale: '✓ Sale recorded', t_pay: '✓ Payment recorded',
    t_custAdd: '✓ Customer added', t_custEdit: '✓ Customer updated',
    t_txnEdit: '✓ Entry updated', t_txnDel: '✓ Entry deleted',
    t_custDel: '✓ Customer deleted',
    t_fillSale: 'Fill customer and amount',
    t_fillPay: 'Fill customer and amount',
    t_fillCust: 'Fill name and phone',
    settings: 'Settings', appearance: 'Appearance', themeLbl: 'Theme',
    themeDefault: 'Default', themeNeo: 'Neo-Brutal', themeBauhaus: 'Bauhaus',
    textSizeLbl: 'Text Size', sizeSmall: 'Small', sizeNormal: 'Normal', sizeLarge: 'Large',
    recentCust: 'Recent Customers',
    todayActivity: "Today's Activity", noActivityToday: 'Nothing recorded today',
    photosLbl: 'Photos',
    undoBtn: 'Undo',
    t_custDelUndo: 'Customer deleted', t_txnDelUndo: 'Entry deleted',
    soldFor: 'sale of', paidLbl2: 'payment received',
    appGuide: 'App Guide', appGuideSub: 'See all features again',
    tourNext: 'Next', tourBack: 'Back', tourSkip: 'Skip', tourDone: 'Done',
    payMethod: 'Payment Method', methodCash: 'Cash', methodUpi: 'UPI',
    qrHint: 'Show this to the customer — they scan it to pay',
    cashTag: '💵 Cash', upiTag: '📱 UPI',
    backupSection: 'Backup & Restore',
    exportBackup: 'Export Backup', exportBackupSub: 'Save all data as a file in your Downloads folder',
    importBackup: 'Restore from Backup', importBackupSub: 'Load data back from a backup file',
    importConfirm: 'This will replace all current data. Continue?',
    backupSaved: 'Backup saved to Downloads',
    backupRestored: 'Backup restored',
    backupInvalid: 'That is not a valid backup file',
    backupReminder: "Tip: It's been a while since your last backup — back up now to keep your data safe",
    autoBackupSaved: 'Auto-backup saved to Downloads',
    importContacts: 'Pick from Contacts', contactsNotSupported: "Not supported in this browser — type name/phone manually",
    smsBtn: 'Send SMS', waFallbackHint: "If that number isn't on WhatsApp, send an SMS instead",
    installPrompt: 'Add this app to your Home Screen — open it directly from an icon',
    installManualHint: "To install: tap ⋮ (top-right) → choose 'Add to Home screen' or 'Install app'",
    billBtn: 'Bill', billTitle: 'Bill', billCustomer: 'Customer:', billDate: 'Date:', billItem: 'Item:',
    billAmount: 'Amount:', billThanks: 'Thank you for shopping with us!', billShareBtn: '📤 Share',
    billCopied: 'Bill copied', billCopyFailed: 'Could not share',
    billPdfSaved: 'Bill PDF saved to Downloads',
    addItemBtn: 'Add another item', totalLbl: 'Total Amount', itemNum: 'Item',
    itemDescPH: 'e.g. Red Banarasi Saree', itemAmtPH: 'Amount (₹)', moreItems: 'more',
  }
};

const t = k => L[lang][k] || k;

function toggleLang() {
  lang = lang === 'hi' ? 'en' : 'hi';
  localStorage.setItem('av_lang', lang);
  document.getElementById('lang-btn').textContent = lang === 'hi' ? 'EN' : 'HI';
  document.querySelector('html').lang = lang === 'hi' ? 'hi' : 'en';
  applyStaticLabels();
  renderAll();
}

function applyStaticLabels() {
  const s = L[lang];
  document.getElementById('tb-name').textContent = s.appName;
  document.getElementById('tb-sub').textContent = s.appSub;
  document.getElementById('lang-btn').textContent = lang === 'hi' ? 'EN' : 'HI';
  document.getElementById('nl-home').textContent = s.home;
  document.getElementById('nl-cust').textContent = s.customers;
  document.getElementById('nl-add').textContent = s.addSale;
  document.getElementById('nl-pay').textContent = s.addPay;
  // Add page
  document.getElementById('lbl-sel-cust').textContent = s.selCust;
  document.getElementById('sc-input').placeholder = s.selCustPH;
  document.getElementById('lbl-add-item').textContent = s.addItemBtn;
  document.getElementById('lbl-total').textContent = s.totalLbl;
  document.getElementById('save-sale-btn').textContent = s.saveSale;
  if (typeof renderSaleItemRows === 'function' && document.getElementById('sale-items-list')) {
    renderSaleItemRows();
    updateSaleTotal();
  }
  // Pay page
  document.getElementById('lbl-pay-cust').textContent = s.payCust;
  document.getElementById('pc-input').placeholder = s.selCustPH;
  document.getElementById('lbl-pay-amt').textContent = s.payAmt;
  document.getElementById('lbl-pay-note').textContent = s.payNote;
  document.getElementById('p-note').placeholder = s.payNotePH;
  document.getElementById('save-pay-btn').textContent = s.savePay;
  document.getElementById('lbl-pay-method').textContent = s.payMethod;
  document.getElementById('lbl-method-cash').textContent = s.methodCash;
  document.getElementById('lbl-method-upi').textContent = s.methodUpi;
  document.getElementById('lbl-qr-hint').textContent = s.qrHint;
  // Customer search
  document.getElementById('search').placeholder = s.searchPH;
  document.getElementById('nc-name').placeholder = s.custName;
  document.getElementById('nc-phone').placeholder = s.custPhone;
  document.getElementById('ac-add-btn').textContent = s.addCustBtn;
  // Overlay call
  document.getElementById('lbl-call').textContent = s.call;
  document.getElementById('settings-title').textContent = s.settings;
  document.getElementById('lbl-import-contact').textContent = s.importContacts;
  document.getElementById('bill-title').textContent = s.billTitle;
  document.getElementById('bill-share-btn').textContent = s.billShareBtn;
  document.querySelector('html').lang = lang === 'hi' ? 'hi' : 'en';
}
