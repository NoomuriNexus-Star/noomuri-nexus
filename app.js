const CORRECT_PASSWORD = "$N00MURI_DA_G0AT";
const NEXUS_PROXY_BASE = "https://nexus-proxy.YOURNAME.workers.dev"; // replace with your Worker URL

// === Utility: show screen ===
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
    el.classList.add('fade-in');
  }
}

// === Splash / Login flow ===
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

  // Mic buttons
  document.getElementById('micBtn').addEventListener('click', startVoiceSearch);
  document.getElementById('aiMicBtn').addEventListener('click', startVoiceSearch);
  document.getElementById('resultsMicBtn').addEventListener('click', startVoiceSearch);

  // AI Mode toggle
  document.getElementById('aiBtn').addEventListener('click', () => {
    showScreen('ai');
  });

  // Back buttons
  document.getElementById('backToHomeBtn').addEventListener('click', () => showScreen('home'));
  document.getElementById('resultsHomeBtn').addEventListener('click', () => showScreen('home'));

  // Results tabs
  document.querySelectorAll('#results .ai-tabs .tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      const q = document.getElementById('resultsInput').value || '';
      proxySearch(q, tabBtn.dataset.tab);
    });
  });

  // Apply saved theme/background
  applySavedTheme();
  applySavedBackground();

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
      applySavedTheme();
      applySavedBackground();
    }, 1400);
  } else {
    loginCard.classList.add('shake');
    setTimeout(() => loginCard.classList.remove('shake'), 500);
    alert("Incorrect password. Try again.");
  }
}

// === Voice search ===
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

// === Customize Nexus Modal ===
function setupCustomizeModal() {
  const customizeBtn = document.getElementById('customizeBtn');
  const modal = document.getElementById('customizeModal');
  const closeBtn = document.getElementById('closeCustomize');

  customizeBtn.addEventListener('click', () => { modal.style.display = 'grid'; });
  closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });

  // Theme options
  const themeRadios = document.querySelectorAll('.theme-options input[name="theme"]');
  themeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      previewTheme(radio.value);
      saveTheme(
        document.documentElement.style.getPropertyValue('--bg'),
        document.documentElement.style.getPropertyValue('--text'),
        document.documentElement.style.getPropertyValue('--card'),
        document.documentElement.style.getPropertyValue('--accent')
      );
      updateThumbnail();
    });
  });

  // Accent swatches
  const swatches = document.querySelectorAll('.accent-swatches .swatch');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const color = swatch.dataset.color;
      document.documentElement.style.setProperty('--accent', color);
      saveTheme(
        document.documentElement.style.getPropertyValue('--bg'),
        document.documentElement.style.getPropertyValue('--text'),
        document.documentElement.style.getPropertyValue('--card'),
        color
      );
      updateThumbnail();
    });
  });

  // Reset / Restore / Discard / Apply / Save
  document.getElementById('resetNexusBtn').addEventListener('click', resetNexus);
  document.getElementById('restoreNexusBtn').addEventListener('click', restoreNexus);
  document.getElementById('discardPreviewBtn').addEventListener('click', discardPreview);
  document.getElementById('applyPreviewBtn').addEventListener('click', applyPreview);
  document.getElementById('savePreviewBtn').addEventListener('click', savePreview);
}

// === Theme persistence ===
function saveTheme(bg, text, card, accent) {
  localStorage.setItem('nexus-theme', JSON.stringify({ bg, text, card, accent }));
}
function applySavedTheme() {
  const saved = localStorage.getItem('nexus-theme');
  if (saved) {
    const { bg, text, card, accent } = JSON.parse(saved);
    document.documentElement.style.setProperty('--bg', bg);
    document.documentElement.style.setProperty('--text', text);
    document.documentElement.style.setProperty('--card', card);
    document.documentElement.style.setProperty('--accent', accent);
  }
}
function previewTheme(value) {
  if (value === 'light') {
    document.documentElement.style.setProperty('--bg', '#fff');
    document.documentElement.style.setProperty('--text', '#000');
    document.documentElement.style.setProperty('--card', '#f5f5f5');
  } else if (value === 'dark') {
    document.documentElement.style.setProperty('--bg', '#000');
    document.documentElement.style.setProperty('--text', '#fff');
    document.documentElement.style.setProperty('--card', '#111');
  } else if (value === 'device') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.style.setProperty('--bg', '#000');
      document.documentElement.style.setProperty('--text', '#fff');
      document.documentElement.style.setProperty('--card', '#111');
    } else {
      document.documentElement.style.setProperty('--bg', '#fff');
      document.documentElement.style.setProperty('--text', '#000');
      document.documentElement.style.setProperty('--card', '#f5f5f5');
    }
  }
  updateThumbnail();
}

// === Background persistence ===
function applySavedBackground() {
  const bg = localStorage.getItem('nexus-bg');
  if (bg) {
    document.body.style.backgroundImage = `url(${bg})`;
  }
}

// === Thumbnail update ===
function updateThumbnail() {
  const thumb = document.getElementById('themeThumbnail');
  if (!thumb) return;
  thumb.style.background = getComputedStyle(document.documentElement).getPropertyValue('--bg');
  thumb.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text');
  thumb.querySelector('.thumbnail-topbar').style.background =
    getComputedStyle(document.documentElement).getPropertyValue('--card');
  thumb.querySelector('.thumbnail-search').style.background =
    getComputedStyle(document.documentElement).getPropertyValue('--card');
}

// === Reset / Restore / Preview workflow ===
let previewThemeState = null;

function applyPreview() {
  previewThemeState = {
    bg: document.documentElement.style.getPropertyValue('--bg'),
    text: document.documentElement.style.getPropertyValue('--text'),
    card: document.documentElement.style.getPropertyValue('--card'),
    accent: document.documentElement.style.getPropertyValue('--accent')
  };
  updateThumbnail();
  alert("Preview applied temporarily. Use Save Settings to commit.");
}
function savePreview() {
  if (!previewThemeState) {
    alert("No preview applied yet.");
    return;
  }
  saveTheme(previewThemeState.bg, previewThemeState.text, previewThemeState.card, previewThemeState.accent);
  alert("Settings saved!");
}

function discardPreview() {
  const saved = localStorage.getItem('nexus-theme');
  if (!saved) {
    alert("No saved settings found.");
    return;
  }
  const { bg, text, card, accent } = JSON.parse(saved);
  document.documentElement.style.setProperty('--bg', bg);
  document.documentElement.style.setProperty('--text', text);
  document.documentElement.style.setProperty('--card', card);
  document.documentElement.style.setProperty('--accent', accent);

  applySavedBackground();
  loadShortcuts();
  updateThumbnail();

  alert("Preview discarded. Reverted to last saved settings.");
}

// === Reset Nexus with backup ===
function resetNexus() {
  const confirmReset = confirm("Are you sure you want to reset Nexus to default settings?");
  if (!confirmReset) return;

  const backup = {
    theme: localStorage.getItem('nexus-theme'),
    shortcuts: localStorage.getItem('nexus-shortcuts'),
    bg: localStorage.getItem('nexus-bg')
  };
  localStorage.setItem('nexus-backup', JSON.stringify(backup));

  localStorage.removeItem('nexus-theme');
  localStorage.removeItem('nexus-shortcuts');
  localStorage.removeItem('nexus-bg');

  document.documentElement.style.setProperty('--bg', '#000');
  document.documentElement.style.setProperty('--text', '#fff');
  document.documentElement.style.setProperty('--card', '#111');
  document.documentElement.style.setProperty('--accent', '#ff0000');
  document.body.style.backgroundImage = 'none';
  document.getElementById('shortcutGrid').innerHTML = '';

  alert("Nexus reset to default. You can restore last settings if needed.");
  showScreen('home');
}

// === Restore Nexus from backup ===
function restoreNexus() {
  const backup = JSON.parse(localStorage.getItem('nexus-backup') || '{}');
  if (!backup.theme && !backup.shortcuts && !backup.bg) {
    alert("No backup found.");
    return;
  }

  if (backup.theme) {
    const { bg, text, card, accent } = JSON.parse(backup.theme);
    document.documentElement.style.setProperty('--bg', bg);
    document.documentElement.style.setProperty('--text', text);
    document.documentElement.style.setProperty('--card', card);
    document.documentElement.style.setProperty('--accent', accent);
    localStorage.setItem('nexus-theme', backup.theme);
  }
  if (backup.shortcuts) {
    localStorage.setItem('nexus-shortcuts', backup.shortcuts);
    loadShortcuts();
  }
  if (backup.bg) {
    localStorage.setItem('nexus-bg', backup.bg);
    applySavedBackground();
  }

  alert("Last settings restored.");
  showScreen('home');
}

// === Shortcuts ===
function loadShortcuts() {
  const grid = document.getElementById('shortcutGrid');
  grid.innerHTML = '';
  const shortcuts = JSON.parse(localStorage.getItem('nexus-shortcuts') || '[]');
  shortcuts.forEach(sc => {
    const btn = document.createElement('button');
    btn.className = 'ghost';
    btn.textContent = sc.name;
    btn.addEventListener('click', () => window.open(sc.url, '_blank'));
    grid.appendChild(btn);
  });
}

function addShortcutPrompt() {
  const name = prompt("Shortcut name:");
  const url = prompt("Shortcut URL:");
  if (!name || !url) return;
  const shortcuts = JSON.parse(localStorage.getItem('nexus-shortcuts') || '[]');
  shortcuts.push({ name, url });
  localStorage.setItem('nexus-shortcuts', JSON.stringify(shortcuts));
  loadShortcuts();
}

// === Proxy Search Results ===
function proxySearch(query, tab = "all") {
  showScreen('results');
  const input = document.getElementById('resultsInput');
  if (input) input.value = query;

  // Set active tab state
  document.querySelectorAll('#results .ai-tabs .tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  const frame = document.getElementById('resultsFrame');
  const url = `${NEXUS_PROXY_BASE}/search?q=${encodeURIComponent(query)}&tab=${encodeURIComponent(tab)}`;
  frame.src = url;
}

// === Wire search bars ===
(() => {
  const homeSearchInput = document.querySelector('#home .search-bar input');
  const aiSearchInput = document.getElementById('aiSearchInput');
  const resultsInput = document.getElementById('resultsInput');

  if (homeSearchInput) {
    homeSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') proxySearch(e.target.value, 'all');
    });
  }

  if (aiSearchInput) {
    aiSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') proxySearch(e.target.value, 'all');
    });
  }

  if (resultsInput) {
    resultsInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') proxySearch(e.target.value,
        document.querySelector('#results .ai-tabs .tab.active')?.dataset.tab || 'all'
      );
    });
  }

  const resultsHomeBtn = document.getElementById('resultsHomeBtn');
  if (resultsHomeBtn) {
    resultsHomeBtn.addEventListener('click', () => showScreen('home'));
  }
})();
