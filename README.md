# Massive Ride

A stock chart you can ride as a 3D roller coaster. The track is daily closing prices: rallies are climbs, selloffs are drops.

## Deploy to Vercel

1. Get a Massive API key at https://massive.com (the free plan works).
2. Put this folder in a GitHub repo and import it at https://vercel.com/new.
   No framework and no build step. Vercel serves `index.html` and runs `api/bars.js` as a function.
3. In the Vercel project, open Settings → Environment Variables and add
   `MASSIVE_API_KEY` = your key. Redeploy.

Or deploy from this folder with the CLI:

```
npx vercel            # first deploy, answers the setup questions
npx vercel env add MASSIVE_API_KEY
npx vercel --prod
```

## How data works

- `api/bars.js` calls Massive's Custom Bars endpoint
  (`/v2/aggs/ticker/{ticker}/range/1/day/{from}/{to}?adjusted=true`) with the key from the
  environment, so the key never reaches the browser. Responses are cached at Vercel's edge for an hour.
- Every preset ride loads live from Massive on page load. The footer shows the bar count and how fast
  Massive answered.
- The plan this site runs on covers about five years of daily history, so the presets all start after
  Nov 2021. Two classic rides (the 2021 GME squeeze and the 2020 COVID crash) are defined in the code with
  `classic: true` and stay hidden on the live site until the plan covers them.
- Anyone can ride any US stock or ETF: type a ticker on the boarding card, or use "Any ticker" for custom dates.

## Share links

- `?ride=gme5` (also `nvda`, `tariffs`, `bear`, `smci`, `tsla`) opens a preset.
- `?t=AMC` opens any ticker over the last five years; add `&from=YYYY-MM-DD&to=YYYY-MM-DD` for a custom window.
- "Copy link" copies the link for whatever ride is on screen.

Keyboard: Space pause, R restart, V switch camera, 1–6 pick a ride.
