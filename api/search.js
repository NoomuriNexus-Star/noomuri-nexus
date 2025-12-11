export default async function handler(req, res) {
  const query = req.query.q;
  if (!query) {
    return res.status(400).send("Missing query");
  }

  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const html = await response.text();
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    res.status(500).send("Error fetching results");
  }
}

