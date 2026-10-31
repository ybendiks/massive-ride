// Proxies Massive's Custom Bars (daily aggregates) so the API key stays on the server.
// Set MASSIVE_API_KEY in Vercel: Project → Settings → Environment Variables.
const TICKER = /^[A-Z][A-Z0-9.\-]{0,9}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

module.exports = async (req, res) => {
  const key = process.env.MASSIVE_API_KEY;
  const q = req.query || {};

  if (q.ping) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ configured: Boolean(key) });
  }
  if (!key) return res.status(500).json({ error: "The server has no Massive API key. Add MASSIVE_API_KEY in Vercel and redeploy." });

  const ticker = String(q.ticker || "").toUpperCase();
  const from = String(q.from || "");
  const to = String(q.to || "");
  if (!TICKER.test(ticker)) return res.status(400).json({ error: "Enter a US ticker symbol, like AMC or BRK.B." });
  if (!DATE.test(from) || !DATE.test(to) || from >= to) return res.status(400).json({ error: "Use dates in YYYY-MM-DD form, with the start before the end." });

  const url = `https://api.massive.com/v2/aggs/ticker/${encodeURIComponent(ticker)}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=50000`;
  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = j.message || j.error || `Massive returned ${r.status}`;
      return res.status(r.status === 429 ? 429 : 502).json({ error: r.status === 429 ? "Massive's rate limit was hit (the free plan allows 5 calls a minute). Try again in a minute." : msg });
    }
    const results = (j.results || []).map(b => ({ t: b.t, c: b.c }));
    // Daily bars for past dates don't change, so let Vercel's edge cache them.
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({ ticker: j.ticker || ticker, count: results.length, results });
  } catch (e) {
    return res.status(502).json({ error: "Couldn't reach Massive. Try again shortly." });
  }
};
