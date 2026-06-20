/* js/tour.js — first-run detection + reusable feature tour */

const TOUR_SLIDES = [
  { icon: '📒',
    hi: { title: 'स्वागत है!', body: 'यह आपकी दुकान की डिजिटल बही-खाता है। अब कागज़ की कॉपी की ज़रूरत नहीं — सब कुछ इस फ़ोन में सुरक्षित रहेगा।' },
    en: { title: 'Welcome!', body: "This is your shop's digital ledger. No more paper notebook — everything stays saved safely on this phone." } },
  { icon: '🏠',
    hi: { title: 'होम स्क्रीन', body: 'बड़ा नंबर दिखाता है कि सभी ग्राहकों से कुल कितना पैसा बकाया है। नीचे महीने का हिसाब और हाल की गतिविधि भी दिखती है।' },
    en: { title: 'Home Screen', body: 'The big number shows how much money customers still owe you in total. Below it you can see this month\u2019s numbers and today\u2019s activity.' } },
  { icon: '🛍️',
    hi: { title: 'नई बिक्री दर्ज करें', body: 'नीचे गुलाबी + बटन दबाएँ। ग्राहक चुनें, राशि डालें — साड़ी की फ़ोटो भी ले सकती हैं। बाद में उस फ़ोटो पर टैप करने से कीमत और तारीख के साथ बड़ी दिखेगी।' },
    en: { title: 'Add a Sale', body: 'Tap the pink + button below. Pick the customer, enter the amount — you can even take a photo of the saree. Tap that photo later to see it enlarged with the price and date.' } },
  { icon: '💰',
    hi: { title: 'भुगतान दर्ज करें', body: "जब कोई ग्राहक पैसे दे, तो 'भुगतान' टैब खोलें। नकद या यूपीआई चुनें — यूपीआई पर एक QR कोड दिखेगा जिसे ग्राहक स्कैन करके सीधे भुगतान कर सकता है। पूरा बकाया एक टैप में चुकाने के लिए 'पूरा' बटन भी है।" },
    en: { title: 'Record a Payment', body: "Open the Payment tab. Choose Cash or UPI — UPI shows a QR code the customer can scan to pay directly. There's also a 'Full' button to clear their whole balance in one tap." } },
  { icon: '📞',
    hi: { title: 'ग्राहक, कॉल और फ़ोन से जोड़ें', body: "'ग्राहक' टैब में सभी की सूची है। हरे कॉल बटन से सीधे फोन लगा सकती हैं। नया ग्राहक जोड़ते समय 'फ़ोन से चुनें' दबाकर अपने फ़ोन की कॉन्टैक्ट लिस्ट से नाम-नंबर सीधे ला सकती हैं — टाइप करने की ज़रूरत नहीं।" },
    en: { title: 'Customers, Call & Contacts', body: "The Customers tab lists everyone. Tap Call to ring them directly. When adding a new customer, tap 'Pick from Contacts' to grab their name and number straight from your phone — no typing needed." } },
  { icon: '💬',
    hi: { title: 'याद दिलाना — WhatsApp या SMS', body: 'किसी भी ग्राहक का पेज खोलें — वहाँ WhatsApp बटन है जो तैयार मैसेज भेज देता है। अगर वह नंबर WhatsApp पर नहीं है, तो ठीक नीचे SMS भेजें बटन भी है।' },
    en: { title: 'Reminders — WhatsApp or SMS', body: "Open any customer's page for a WhatsApp button with a ready-made reminder. If that number isn't on WhatsApp, there's a Send SMS button right below it as a backup." } },
  { icon: '↩️',
    hi: { title: 'गलती हो जाए तो?', body: "कुछ भी हटाने के बाद कुछ सेकंड के लिए 'पूर्ववत करें' बटन दिखता है — तब तक कुछ भी पूरी तरह नहीं हटता।" },
    en: { title: 'Made a mistake?', body: "After deleting anything, you get a few seconds with an Undo button before it's really gone." } },
  { icon: '💾',
    hi: { title: 'बैकअप ज़रूरी है', body: 'सेटिंग्स (⚙️) में जाकर "बैकअप सेव करें" से सारा डेटा एक फ़ाइल में डाउनलोड फ़ोल्डर में सेव होता है — फ़ोन बदलने या डेटा साफ़ होने पर भी सुरक्षित रहता है। ऐप अपने-आप भी हर 3 दिन में एक बैकअप ले लेता है। कुछ गड़बड़ हो तो "बैकअप से वापस लाएँ" से सब कुछ वापस आ जाता है।' },
    en: { title: 'Backups matter', body: 'In Settings (\u2699\ufe0f), "Export Backup" saves everything to a file in your Downloads folder — it survives even if data ever gets cleared. The app also auto-backs-up every 3 days on its own. If something goes wrong, "Restore from Backup" brings it all back.' } },
  { icon: '🎨',
    hi: { title: 'भाषा, थीम और टेक्स्ट साइज़', body: "ऊपर 'HI/EN' दबाकर भाषा बदलें। गियर ⚙️ आइकन में तीन थीम (डिफ़ॉल्ट, नियो-ब्रूटल, बाउहॉस) और टेक्स्ट साइज़ (छोटा/सामान्य/बड़ा) अपनी पसंद के अनुसार बदल सकती हैं।" },
    en: { title: 'Language, Theme & Text Size', body: "Tap 'HI/EN' at the top to switch language. The gear \u2699\ufe0f icon has three color themes and a text-size option (Small/Normal/Large) — pick whatever's most comfortable to read." } },
  { icon: '✅',
    hi: { title: 'बस इतना ही!', body: 'सब कुछ इस फ़ोन में अपने-आप सेव हो जाता है — इंटरनेट की ज़रूरत नहीं। यह गाइड आप कभी भी सेटिंग्स (⚙️) से फिर देख सकती हैं।' },
    en: { title: "That's it!", body: 'Everything saves automatically on this phone — no internet needed. Reopen this guide anytime from Settings (\u2699\ufe0f).' } },
];

let tourIdx = 0;

function checkFirstRun() {
  if (!localStorage.getItem('av_onboarded')) openTour();
}

function openTour() {
  tourIdx = 0;
  renderTourSlide();
  document.getElementById('tour-overlay').classList.add('open');
}
function closeTour(markDone) {
  document.getElementById('tour-overlay').classList.remove('open');
  if (markDone) localStorage.setItem('av_onboarded', '1');
}
function skipTour() { closeTour(true); }
function nextTourSlide() {
  if (tourIdx >= TOUR_SLIDES.length - 1) { closeTour(true); return; }
  tourIdx++;
  renderTourSlide();
}
function prevTourSlide() {
  if (tourIdx === 0) return;
  tourIdx--;
  renderTourSlide();
}
function renderTourSlide() {
  const slide = TOUR_SLIDES[tourIdx];
  const c = slide[lang] || slide.en;
  document.getElementById('tour-icon').textContent = slide.icon;
  document.getElementById('tour-title').textContent = c.title;
  document.getElementById('tour-body').textContent = c.body;
  document.getElementById('tour-dots').innerHTML = TOUR_SLIDES
    .map((_, i) => `<span class="tour-dot ${i === tourIdx ? 'active' : ''}"></span>`).join('');

  const backBtn = document.getElementById('tour-back-btn');
  backBtn.style.visibility = tourIdx === 0 ? 'hidden' : 'visible';

  const isLast = tourIdx === TOUR_SLIDES.length - 1;
  document.getElementById('tour-next-btn').textContent = isLast ? t('tourDone') : t('tourNext');
  document.getElementById('tour-skip-btn').style.display = isLast ? 'none' : 'block';
  document.getElementById('tour-skip-btn').textContent = t('tourSkip');
  backBtn.textContent = t('tourBack');
}

// Re-opened from Settings — close that modal first so they don't stack
function openTourFromSettings() {
  closeSettings();
  openTour();
}
