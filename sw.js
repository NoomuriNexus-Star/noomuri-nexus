export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      // === Root route: serve full branded HTML ===
      if (url.pathname === "/") {
        return new Response(await getFullHtml(), {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }

      // === Version endpoint ===
      if (url.pathname === "/version.json") {
        return new Response(JSON.stringify({
          layer: "worker",
          name: "noomuri-nexus",
          timestamp: Date.now(),
          source: "https://noomuri-nexus.susbobby1.workers.dev"
        }), {
          status: 200,
          headers: corsHeaders(request, { "Content-Type": "application/json" })
        });
      }

      // === Search route ===
      if (url.pathname === "/search") {
        const q = url.searchParams.get("q") || "";
        const tab = (url.searchParams.get("tab") || "all").toLowerCase();
        const mode = (url.searchParams.get("mode") || "html").toLowerCase();

        const cacheKey = new Request(url.toString(), request);
        const cache = caches.default;
        let cached = await cache.match(cacheKey);
        if (cached) return cached;

        // Pick upstream based on tab
        let upstream = `https://duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
        if (tab === "images") {
          upstream = `https://duckduckgo.com/?q=${encodeURIComponent(q)}&iax=images&ia=images`;
        } else if (tab === "videos") {
          upstream = `https://duckduckgo.com/?q=${encodeURIComponent(q)}&iax=videos&ia=videos`;
        } else if (tab === "news") {
          upstream = `https://duckduckgo.com/?q=${encodeURIComponent(q)}&iar=news&ia=news`;
        } else if (tab === "more") {
          upstream = `https://duckduckgo.com/?q=${encodeURIComponent(q)}&ia=web`;
        }

        const upstreamRes = await fetch(upstream, {
          headers: {
            "User-Agent": "Mozilla/5.0 NexusProxy",
            "Accept": "text/html"
          }
        });

        if (!upstreamRes.ok) throw new Error(`Upstream error: ${upstreamRes.status}`);

        let html = await upstreamRes.text();
        html = html.replace(/DuckDuckGo/gi, "Nexus");
        html = html.replace(/href="\/l\/\?kh=-1&uddg=([^"]+)"/g, (_m, target) => {
          const decoded = decodeURIComponent(target);
          return `href="/go?url=${encodeURIComponent(decoded)}"`;
        });
        html = html.replace(/href="https:\/\/duckduckgo\.com\/\?q=([^"]+)"/g, (_m, q2) => {
          return `href="/search?q=${q2}"`;
        });

        let response;
        if (mode === "json") {
          response = new Response(JSON.stringify({ query: q, tab, html }), {
            status: 200,
            headers: corsHeaders(request, {
              "Content-Type": "application/json",
              "Cache-Control": "s-maxage=300"
            })
          });
        } else {
          response = new Response(html, {
            status: 200,
            headers: corsHeaders(request, {
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "s-maxage=300"
            })
          });
        }

        await cache.put(cacheKey, response.clone());
        return response;
      }

      // === Redirect route ===
      if (url.pathname === "/go") {
        const target = url.searchParams.get("url");
        if (!target || !/^https?:\/\//i.test(target)) {
          return new Response("Invalid URL", { status: 400, headers: corsHeaders(request) });
        }
        return Response.redirect(target, 302);
      }

      // === Preflight CORS ===
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders(request) });
      }

      return new Response("Not found", { status: 404, headers: corsHeaders(request) });
    } catch (err) {
      const errorHtml = `
        <html><head><title>Nexus Error</title><style>
        body { background:#000; color:#fff; font-family:sans-serif; text-align:center; padding:50px; }
        h1 { color:#ff0066; } a { color:#00ffcc; }
        </style></head><body>
        <h1>⚠ Nexus Error</h1>
        <p>${escapeHtml(err.message || "Unknown error")}</p>
        <p><a href="/">Return to Nexus</a></p>
        </body></html>
      `;
      return new Response(errorHtml, {
        status: 500,
        headers: corsHeaders(request, { "Content-Type": "text/html; charset=utf-8" })
      });
    }
  }
};

// === Serve full branded HTML ===
async function getFullHtml() {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Noomuri Nexus</title><style>
body { background:#000; color:#fff; font-family:system-ui,sans-serif; margin:0; text-align:center; }
#spinner, #login, #main { display:none; height:100vh; align-items:center; justify-content:center; flex-direction:column; }
#spinner.active, #login.active, #main.active { display:flex; }
.loader { border:6px solid #333; border-top:6px solid #00ffcc; border-radius:50%; width:60px; height:60px;
  animation: spin 1s linear infinite, glowPulse 2s ease-in-out infinite; }
@keyframes spin { 0%{transform:rotate(0deg);}100%{transform:rotate(360deg);} }
@keyframes glowPulse { 0%{box-shadow:0 0 5px #00ffcc;}50%{box-shadow:0 0 25px #00ffcc;}100%{box-shadow:0 0 5px #00ffcc;} }
.search-bar { margin-top:20px; }
.search-bar input { padding:8px; width:60%; }
.search-bar button { padding:8px 16px; margin-left:10px; }
.tabs { display:flex; gap:10px; margin-top:20px; justify-content:center; }
.tabs button { background:#111; color:#fff; border:1px solid #333; padding:8px 16px; cursor:pointer; }
#layerBadge { position:fixed; bottom:10px; right:10px; background:#00ffcc; color:#000; padding:6px 12px; font-weight:bold; border-radius:6px; font-family:system-ui,sans-serif; z-index:1000; }
</style></head><body>
<div id="spinner" class="active"><div class="loader"></div></div>
<div id="login"><button onclick="doLogin()">Login to Nexus</button></div>
<div id="main">
  <h1 style="color:#00ffcc;">Noomuri Nexus</h1>
  <div class="search-bar">
    <input id="searchBox" placeholder="Search..." />
    <button onclick="runSearch()">Search</button>
  </div>
  <div class="tabs">
    <button onclick="switchTab('all')">All</button>
    <button onclick="switchTab('images')">Images</button>
    <button onclick="switchTab('videos')">Videos</button>
    <button onclick="switchTab('news')">News</button>
    <button onclick="switchTab('more')">More</button>
  </div>
  <div id="results" style="margin-top:20px;"></div>
</div>
<div id="layerBadge">Detecting…</div>
<script>
let currentTab = "all";
setTimeout(() => {
  document.getElementById("spinner").classList.remove("active");
  document.getElementById("login").classList.add("active");
}, 2000);

function doLogin() {
  document.getElementById("login").classList.remove("active");
  document.getElementById("spinner").classList.add("active");
  setTimeout(() => {
    document.getElementById("spinner").classList.remove("active");
    document.getElementById("main").classList.add("active");
    detectLayer();
  }, 2000);
}

function switchTab(tab) {
  currentTab = tab;
  runSearch();
}

async function runSearch() {
const query = document.getElementById("searchBox").value;
async function runSearch() {
  const query = document.getElementById("searchBox").value;
  if (!query) return;

  // Show spinner overlay while fetching
  document.getElementById("spinner").classList.add("active");
  document.getElementById("main").classList.remove("active");

  try {
    const res = await fetch(`/search?q=${encodeURIComponent(query)}&tab=${currentTab}&mode=json`);
    const data = await res.json();

    // Inject results into the page
    document.getElementById("results").innerHTML = data.html;
  } catch (err) {
    document.getElementById("results").innerHTML = `<p style="color:#ff0066;">Error: ${err.message}</p>`;
  } finally {
    // Hide spinner and show main UI again
    document.getElementById("spinner").classList.remove("active");
    document.getElementById("main").classList.add("active");
  }
}

async function detectLayer() {
  try {
    const res = await fetch("/version.json");
    const data = await res.json();
    setLayerBadge(data.layer);
  } catch {
    setLayerBadge("fallback");
  }
}

function setLayerBadge(layer) {
  const badge = document.getElementById("layerBadge");
  if (layer === "worker") {
    badge.textContent = "Live";
    badge.style.background = "#00ffcc";
    badge.style.color = "#000";
  } else {
    badge.textContent = "Fallback";
    badge.style.background = "#ff0066";
    badge.style.color = "#fff";
  }
}
</script>
</body></html>`;
}
