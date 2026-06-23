/* js/camera.js — In-app camera (getUserMedia)
   Replaces the native file-input camera intent, which was unreliable on
   Android: front camera worked, rear camera (capture="environment") would
   open the live viewfinder but never return to a confirm/retake screen on
   some devices, and removing the `capture` attribute entirely sometimes
   made Chrome show the Photos picker with no camera option at all.
   This module owns the whole flow itself — live preview, shutter, and a
   confirm/retake step — so it never depends on any OS camera app or
   picker behaving a particular way. If getUserMedia is unavailable or
   permission is denied, it falls back to the existing gallery-only file
   input for that field. */

let camStream = null;
let camFacing = 'environment';
let camOnCaptured = null;   // function(dataUrl) — called once the user confirms a shot
let camFallbackInputId = null; // id of the hidden gallery-only <input type=file> to use if camera fails

function openCamera(onCaptured, fallbackInputId) {
  camOnCaptured = onCaptured;
  camFallbackInputId = fallbackInputId;
  camFacing = 'environment';
  startCamStream();
}

function startCamStream() {
  stopCamStream();
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    camFallbackToGallery();
    return;
  }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: camFacing }, audio: false })
    .then(stream => {
      camStream = stream;
      const v = document.getElementById('cam-video');
      v.srcObject = stream;
      showCamOverlay();
    })
    .catch(() => camFallbackToGallery());
}

function camFallbackToGallery() {
  closeCamera();
  toast(t('camPermDenied'));
  if (camFallbackInputId) {
    const el = document.getElementById(camFallbackInputId);
    if (el) el.click();
  }
}

function showCamOverlay() {
  document.getElementById('cam-gallery-link').textContent = t('camUseGallery');
  document.getElementById('cam-video').style.display = 'block';
  document.getElementById('cam-preview-img').style.display = 'none';
  document.getElementById('cam-bar-live').style.display = 'flex';
  document.getElementById('cam-bar-preview').style.display = 'none';
  document.getElementById('cam-overlay').classList.add('open');
}

function camShutter() {
  const v = document.getElementById('cam-video');
  const c = document.getElementById('cam-canvas');
  if (!v.videoWidth) return; // stream not ready yet — ignore a too-eager tap
  c.width = v.videoWidth;
  c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
  document.getElementById('cam-preview-img').src = c.toDataURL('image/jpeg', 0.9);
  v.style.display = 'none';
  document.getElementById('cam-preview-img').style.display = 'block';
  document.getElementById('cam-bar-live').style.display = 'none';
  document.getElementById('cam-bar-preview').style.display = 'flex';
}

function camRetake() {
  document.getElementById('cam-video').style.display = 'block';
  document.getElementById('cam-preview-img').style.display = 'none';
  document.getElementById('cam-bar-live').style.display = 'flex';
  document.getElementById('cam-bar-preview').style.display = 'none';
}

function camConfirm() {
  const c = document.getElementById('cam-canvas');
  const cb = camOnCaptured;
  c.toBlob(blob => {
    if (blob && cb) compressPhoto(blob, dataUrl => cb(dataUrl));
  }, 'image/jpeg', 0.92);
  closeCamera();
}

function switchCamera() {
  camFacing = camFacing === 'environment' ? 'user' : 'environment';
  startCamStream();
}

function useCameraGalleryFallback() {
  const id = camFallbackInputId;
  closeCamera();
  if (id) {
    const el = document.getElementById(id);
    if (el) el.click();
  }
}

function closeCamera() {
  stopCamStream();
  document.getElementById('cam-overlay').classList.remove('open');
}

function stopCamStream() {
  if (camStream) {
    camStream.getTracks().forEach(tr => tr.stop());
    camStream = null;
  }
}
