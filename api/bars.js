// Serves daily bars for the site's six fixed rides only, so the Massive key
// can't be used as a general data feed. Set MASSIVE_API_KEY in Vercel.
const RIDES = {
  gme5:    { ticker: "GME",  from: "2021-11-01", to: null },
  nvda:    { ticker: "NVDA", from: "2022-10-03", to: null },
  tariffs: { ticker: "SPY",  from: "2025-01-02", to: "2025-08-29" },
  bear:    { ticker: "QQQ",  from: "2021-11-01", to: "2023-06-30" },
  smci:    { ticker: "SMCI", from: "2023-10-02", to: "2025-02-28" },
  tsla:    { ticker: "TSLA", from: "2024-09-03", to: "2025-06-30" },
};

module.exports = async (req, res) => {
  const key = process.env.MASSIVE_API_KEY;
  const q = req.query || {};

  if (q.ping) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ configured: Boolean(key) });
  }
  if (!key) return res.status(500).json({ error: "The server has no Massive API key." });

  const ride = RIDES[String(q.ride || "")];
  if (!ride) return res.status(404).json({ error: "Unknown ride." });

  const today = new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10);
  const to = ride.to || today;
  const url = `https://api.massive.com/v2/aggs/ticker/${ride.ticker}/range/1/day/${ride.from}/${to}?adjusted=true&sort=asc&limit=50000`;
  try {
    const t0 = Date.now();
    const r = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    const massive_ms = Date.now() - t0;
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ error: "Massive didn't return data. Try again shortly." });
    const results = (j.results || []).map(b => ({ t: b.t, c: b.c }));
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=600");
    return res.status(200).json({ ticker: ride.ticker, count: results.length, massive_ms, results });
  } catch (e) {
    return res.status(502).json({ error: "Couldn't reach Massive. Try again shortly." });
  }
};
