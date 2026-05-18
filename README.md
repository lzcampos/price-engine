# Price Engine — take-home (Conecta+)

**Node.js + TypeScript** API to register creator profiles, estimate recommended rates by deliverable type (EUR, min–max range + justification), and compare two profiles with a **growth potential** note against a same-niche benchmark.

## Requirements

- **Node.js 20+** (tested on Node 24).
- Local SQLite via **LibSQL** (`@libsql/client`, file at `data/price-engine.db`) — avoids `better-sqlite3` native bindings that often break on newer Node versions.

## Getting started

```bash
npm install
npm run db:migrate   # applies SQL in drizzle/
npm run seed       # fictional data + brief-inspired profiles
npm run dev        # API at http://localhost:3000
```

Compiled local run:

```bash
npm run build
npm start
```

### Environment variables

| Variable       | Default                          |
|----------------|----------------------------------|
| `PORT`         | `3000`                           |
| `DATABASE_URL` | Local: `./data/price-engine.db`. On **Vercel** (`VERCEL=1`), defaults to `/tmp/price-engine.db` unless set. Remote **Turso / LibSQL**: `libsql://…`. |
| `LIBSQL_AUTH_TOKEN` | Optional. Auth token for remote LibSQL (Turso). |

## Deploying on Vercel

This app is a **Fastify** backend. Vercel detects [`src/server.ts`](src/server.ts) and runs it as a function. Common reasons it “does not work”:

1. **404 on `/`** — there was no root route before; `GET /` now returns a small JSON index. Use `GET /health` or the API routes below.
2. **Read-only filesystem** — you cannot create `data/price-engine.db` in the project directory on Vercel. When `VERCEL=1`, the app defaults to **`/tmp/price-engine.db`** (writable) and runs **migrations + seed** automatically on first use if the database is empty.
3. **Ephemeral `/tmp`** — each serverless instance may get a cold empty DB; demo data is re-seeded when the DB has no rows. For real traffic, point **`DATABASE_URL`** at [Turso](https://turso.tech/) or another hosted LibSQL/Postgres and run migrations there.

Redeploy after pulling these changes. Optional `vercel.json` is not required for the [documented Fastify flow](https://vercel.com/docs/frameworks/backend/fastify).

## Endpoints

### 1. Register creator — `POST /creators`

```bash
curl -s -X POST http://localhost:3000/creators \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Example",
    "niche": "fitness",
    "yearsActiveUgc": 1.5,
    "platforms": [
      { "platform": "instagram", "audienceSize": 12000, "engagementRateApprox": 5.5 },
      { "platform": "tiktok", "audienceSize": 40000, "engagementRateApprox": 6.2 }
    ]
  }'
```

### 2. Recommended rates — `GET /creators/:id/pricing`

Optional query flags (boolean): `includeExtendedUsageRights`, `exclusivityCampaign`, `rushDelivery` (`1`/`true`/`0`/`false`).

```bash
curl -s "http://localhost:3000/creators/seed-paola-food/pricing"
curl -s "http://localhost:3000/creators/seed-paola-food/pricing?exclusivityCampaign=1&includeExtendedUsageRights=1"
```

Response: `deliverables` with keys `storyPack`, `feedPost`, `reelShort`, `ugcBrandOnly`, `longVideo`; each includes `min`, `max`, `recommended`, `justification`, `baseRateEur`, and `factors` (multipliers used).

### 3. Compare two profiles — `GET /comparison?a=:id&b=:id`

```bash
curl -s "http://localhost:3000/comparison?a=seed-lucia-food-junior&b=seed-paola-food"
```

Includes `byDeliverable` (deltas), `summary` (main signal differences), and `potentialInsight`: automatic benchmark with the same **`nicheKey`**, higher experience or audience, excluding the two creators being compared (see seed: Carmen as a senior food reference).

### Health — `GET /health`

## How the pricing model works

This implementation uses a **deterministic, explainable** engine (no ML or AI APIs), easy to tune with the business.

1. **Base price per deliverable** (`BASE_RATES_EUR` in [`src/domain/pricing-engine/constants.ts`](src/domain/pricing-engine/constants.ts)): relative effort (story less than feed less than reel less than brand-only UGC less than long-form video).

2. **Audience multiplier**: sum followers across platforms and apply a **log** scale `1 + log10(followers/1k) * 0.35` with a cap — diminishing returns (100k is not 10× 10k).

3. **Engagement**: **audience-weighted** average per platform; discrete bands (~8%, ~5%, ~3%) that raise or lower the multiplier.

4. **Niche**: premium table (finance above mental health above wellness above food/gaming…). Free-text input is **normalized** to an internal key (see [`src/shared/niche.ts`](src/shared/niche.ts)).

5. **UGC experience**: `1 + min(years * 0.08, 0.4)` — capped trajectory bonus.

6. **Platform diversity**: small bump for distinct platforms (more surfaces for the brand to reuse).

7. **Optional flags** (pricing query): extended usage rights, exclusivity, rush — fixed multipliers in constants.

8. **Min–max range**: `recommended * 0.85` and `* 1.2` to reflect negotiation, brief complexity, rights, and exclusivity not fully modeled.

**Justification** text is assembled from threshold rules in English ([`justification.ts`](src/domain/pricing-engine/justification.ts)), not from an LLM.

**Audience aggregation:** sum of `audienceSize` across platforms (documented; another valid choice would be “dominant platform only”).

## What I deliberately did not build (and why)

- Authentication / multi-tenant / roles.
- Web UI or real social network integration.
- Persisted “quotes” or historical rate change log.
- Multi-currency i18n (EUR only in the model).
- Automated HTTP E2E tests (prioritized domain tests with Vitest).

## What I would add with more time

- Calibration on anonymized real data (percentiles by niche and country).
- Engine versioning (`pricing_engine_version`) and output snapshots for audit.
- A “sensitivity” endpoint (which input moves price the most).
- Multi-currency and regional PPP adjustments.
- Admin panel to tune constants without a deploy.

## Scale (thousands of concurrent creators)

- **SQLite / local LibSQL** is not the end state: move to **Postgres** (or distributed Turso/libsql) with indexes on `creator_id`, connection pooling, and read replicas.
- **Cache** pricing results by `(creator_id, engine_version, optional flags)` with TTL or invalidation on profile edit.
- **Rate limiting** and pagination on any list endpoints.
- **Queue** for recomputation if the engine becomes heavier (e.g. Monte Carlo — not needed today).
- **Observability**: p95 latency, traces on comparison, error alerts.

## Tests

```bash
npm test
```

## Code layout

- [`src/domain/pricing-engine/`](src/domain/pricing-engine/) — product core (rules + tests).
- [`src/modules/`](src/modules/) — thin HTTP: creators, pricing, comparison.
- [`src/db/`](src/db/) — Drizzle schema + LibSQL client.
- [`scripts/seed.ts`](scripts/seed.ts) — fictional profiles (inspired by Valentina, Paola, Mariana, Emilio from the brief + extra profiles for benchmarking).

## Brief interpretation

- The brief mentions real-world EUR rates: those are **narrative reference** only; API numbers come from the **heuristic model**, not scraping or copying those rates.
- The “see your potential” idea is implemented as **`potentialInsight` on `/comparison`**, picking a third seed creator in the same niche when one exists in the database.

