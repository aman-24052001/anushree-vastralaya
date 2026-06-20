/* js/tour.js — first-run detection + reusable feature tour */

const TOUR_SLIDES = [
  { icon: '📒',
    hi: { title: 'स्वागत है!', body: 'यह आपकी दुकान की डिजिटल बही-खाता है। अब कागज़ की कॉपी की ज़रूरत नहीं — सब कुछ इस फ़ोन में सुरक्षित रहेगा।' },
    en: { title: 'Welcome!', body: "This is your shop's digital ledger. No more paper notebook — everything stays saved safely on this phone." } },
  { icon: '🏠',
    hi: { title: 'होम स्क्रीन', body: 'बड़ा नंबर दिखाता है कि सभी ग्राहकों से कुल कितना पैसा बकाया है। नीचे महीने का हिसाब और हाल की गतिविधि भी दिखती है।' },
    en: { title: 'Home Screen', body: 'The big number shows how much money customers still owe you in total. Below it you can see this month\u2019s numbers and today\u2019s activity.' } },
  { icon: '🛍️',
    hi: { title: 'नई बिक्री दर्ज करें', body: 'नीचे गुलाबी + बटन दबाएँ। ग्राहक चुनें, राशि डालें — साड़ी की फ़ोटो भी ले सकती हैं।' },
    en: { title: 'Add a Sale', body: 'Tap the pink + button below. Pick the customer, enter the amount — you can even take a photo of the saree.' } },
  { icon: '💰',
    hi: { title: 'भुगतान दर्ज करें', body: "जब कोई ग्राहक पैसे दे, तो 'भुगतान' टैब खोलें। पूरा बकाया एक टैप में चुकाने के लिए 'पूरा' बटन भी है।" },
    en: { title: 'Record a Payment', body: "When a customer pays you, open the Payment tab. There's even a 'Full' button to clear their whole balance in one tap." } },
  { icon: '📞',
    hi: { title: 'ग्राहक और कॉल', body: "'ग्राहक' टैब में सभी की सूची है। हरे कॉल बटन से सीधे फोन लगा सकती हैं — नंबर डायल करने की ज़रूरत नहीं।" },
    en: { title: 'Customers & Call', body: "The Customers tab lists everyone. Tap the green Call button to ring them directly — no need to dial the number." } },
  { icon: '💬',
    hi: { title: 'WhatsApp याद दिलाना', body: 'किसी भी ग्राहक का पेज खोलें — वहाँ एक WhatsApp बटन है जो उन्हें भुगतान की याद दिलाने वाला तैयार मैसेज भेज देता है।' },
    en: { title: 'WhatsApp Reminder', body: "Open any customer's page — there's a WhatsApp button that sends them a ready-made, polite payment reminder." } },
  { icon: '↩️',
    hi: { title: 'गलती हो जाए तो?', body: "कुछ भी हटाने के बाद कुछ सेकंड के लिए 'पूर्ववत करें' बटन दिखता है — तब तक कुछ भी पूरी तरह नहीं हटता।" },
    en: { title: 'Made a mistake?', body: "After deleting anything, you get a few seconds with an Undo button before it's really gone." } },
  { icon: '🎨',
    hi: { title: 'भाषा और रंग', body: "ऊपर 'HI/EN' दबाकर भाषा बदलें। गियर ⚙️ आइकन से रंग और टेक्स्ट का आकार अपनी पसंद के अनुसार बदल सकती हैं।" },
    en: { title: 'Language & Look', body: "Tap 'HI/EN' at the top to switch language. The gear \u2699\ufe0f icon lets you change the colors and text size." } },
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
