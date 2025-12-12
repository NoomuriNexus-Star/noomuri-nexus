function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

window.onload = () => {
  setTimeout(() => showScreen('login'), 1500);
};

function startApp() {
  const name = document.getElementById('username').value.trim();
  if (name) {
    localStorage.setItem('nexusUser', name);
    document.getElementById('userDisplay').textContent = name;
    showScreen('home');
  }
}

async function runSearch() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const data = await response.json();

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  data.results.forEach(item => {
    const div = document.createElement('div');
    div.className = 'result';
    div.innerHTML = `<a href="${item.link}" target="_blank">${item.title}</a><p>${item.snippet}</p>`;
    resultsDiv.appendChild(div);
  });
}
