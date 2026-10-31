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
- With a key configured, the preset rides load from Massive and the footer reads
  "Data: Massive daily aggregates". If Massive can't cover a ride's dates (the free plan has 2 years
  of history, so the 2020–21 rides need a paid plan), that ride falls back to the bundled sample data
  and the footer says so.
- "Load Massive data" lets visitors type any ticker and date range.

Keyboard: Space pause, R restart, V switch camera, 1–5 pick a ride.
