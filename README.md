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

- `api/bars.js` serves daily bars for the six fixed rides only (`/api/bars?ride=gme5`). It calls
  Massive's Custom Bars endpoint (`/v2/aggs/ticker/{ticker}/range/1/day/{from}/{to}?adjusted=true`)
  with the key from the environment. The key never reaches the browser, and the function can't be used
  to fetch any other ticker or date range. Responses are cached at Vercel's edge for an hour.
- Rides: `gme5`, `nvda`, `tariffs`, `bear`, `smci`, `tsla`. To change the lineup, edit the `RIDES`
  table in both `api/bars.js` and `index.html`.
- The footer shows how many bars Massive returned and how fast it answered.

## Share links

`?ride=gme5` (also `nvda`, `tariffs`, `bear`, `smci`, `tsla`) opens a ride. "Copy link" copies the link for the ride on screen.

Keyboard: Space pause, R restart, V switch camera, 1–6 pick a ride.
