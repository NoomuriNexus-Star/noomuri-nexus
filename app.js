const CORRECT_PASSWORD = "$N00MURI_DA_G0AT";

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  el.classList.add('active');
  el.classList.add('fade-in');
}

window.addEventListener('load', () => {
  // Splash → Login
  setTimeout(() => {
    document.getElementById('splash').classList.add('fade-out');
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

  // Customize modal
  setupCustomizeModal();

  // Shortcuts
  loadShortcuts();
  document.getElementById('addShortcutBtn').addEventListener('click', addShortcutPrompt);

  // Mic button
  document.getElementById('micBtn').addEventListener('click', startVoiceSearch);
  document.getElementById('aiMicBtn').addEventListener('click', startVoiceSearch);

  // AI Mode toggle
  document.getElementById('aiBtn').addEventListener('click', () => {
    showScreen('ai');
  });

  // Back to home from AI Mode
  document.getElementById('backToHomeBtn').addEventListener('click', () => {
    showScreen('home');
  });

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
    loginCard.classList.add('shake');
    setTimeout(() => loginCard.classList.remove('shake'), 500);
    alert("Incorrect password. Try again.");
  }
}

// Voice search logic
function startVoiceSearch() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.querySelector('.screen.active input[type="text"]');
    if (input) input.value = transcript;
  };

  recognition.onerror = (event) => {
    alert("Voice search error: " + event.error);
  };

  recognition.start();
}
