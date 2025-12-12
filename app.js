const CORRECT_PASSWORD = "$N00MURI_DA_G0AT";

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  el.classList.add('active');
  if (id === 'login' || id === 'home') el.classList.add('fade-in');
}

window.addEventListener('load', () => {
  // Splash -> login
  setTimeout(() => {
    const splash = document.getElementById('splash');
    splash.classList.add('fade-out');
    setTimeout(() => showScreen('login'), 800);
  }, 2200);

  // Login events
  document.getElementById('loginBtn').addEventListener('click', startApp);
  document.getElementById('password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startApp();
  });

  // Toggle password visibility
  const toggleBtn = document.getElementById('togglePassword');
  toggleBtn.addEventListener('click', () => {
    const input = document.getElementById('password');
    if (input.type === "password") {
      input.type = "text";
      toggleBtn.textContent = "🙈";
    } else {
      input.type = "password";
      toggleBtn.textContent = "👁️";
    }
  });

  // Customize modal, shortcuts, lens, mic, AI setup (same as before)
  setupCustomizeModal();
  loadShortcuts();
  document.getElementById('addShortcutBtn').addEventListener('click', addShortcutPrompt);
  document.getElementById('lensBtn').addEventListener('click', openLensOverlay);
  document.getElementById('micBtn').addEventListener('click', startVoiceSearch);
  document.getElementById('aiBtn').addEventListener('click', toggleAIMode);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});

function startApp() {
  const pw = document.getElementById('password').value.trim();
  const loginCard = document.querySelector('.login-card');

  if (pw === CORRECT_PASSWORD) {
    showScreen('loading');
    setTimeout(() => {
      showScreen('home');
      applySavedBackground();
    }, 1400);
  } else {
    // Shake animation on wrong password
    loginCard.classList.add('shake');
    setTimeout(() => loginCard.classList.remove('shake'), 500);
    alert("Incorrect password. Try again.");
  }
}

// Search, voice search, AI mode, customize modal, shortcuts functions remain same as before
