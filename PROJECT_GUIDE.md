# Crypto Sentry — Complete Project Guide

This document explains **what** the project uses, **why** it uses it, and **how** each part works — from sign-up to live prices, alerts, and deployment.

---

## Table of contents

1. [What is Crypto Sentry?](#1-what-is-crypto-sentry)
2. [Tech stack — what & why](#2-tech-stack--what--why)
3. [High-level architecture](#3-high-level-architecture)
4. [Project structure](#4-project-structure)
5. [Environment variables](#5-environment-variables)
6. [Database — schema & where data lives](#6-database--schema--where-data-lives)
7. [Authentication](#7-authentication)
8. [Market data pipeline](#8-market-data-pipeline)
9. [Flash-crash detection & alerts](#9-flash-crash-detection--alerts)
10. [Watchlist](#10-watchlist)
11. [Profile & avatars](#11-profile--avatars)
12. [Settings](#12-settings)
13. [API routes](#13-api-routes)
14. [Logging & debugging](#14-logging--debugging)
15. [Deployment (Vercel + PostgreSQL)](#15-deployment-vercel--postgresql)
16. [Commands & common tasks](#16-commands--common-tasks)
17. [Known limitations on serverless](#17-known-limitations-on-serverless)

---

## 1. What is Crypto Sentry?

Crypto Sentry is a **crypto market monitoring dashboard** that:

- Shows **live prices** for the top 100 coins (via CoinGecko)
- Detects **flash price drops** and saves alerts to the database
- Lets signed-in users maintain a **personal watchlist**
- Supports **email/password** and **Google** sign-in with email OTP verification

The UI uses a cyber/terminal aesthetic. All dashboard pages require authentication.

---

## 2. Tech stack — what & why

| Technology | What it does | Why we use it |
|------------|--------------|---------------|
| **Next.js 15** (App Router) | Full-stack React framework | Server components, API routes, middleware, and deployment on Vercel in one repo |
| **React 19** | UI library | Component model for dashboard, auth forms, and live price widgets |
| **TypeScript** | Typed JavaScript | Safer refactors across API routes, Prisma, and UI |
| **Tailwind CSS 4** | Utility-first styling | Fast theming (`globals.css` tokens) and responsive layout |
| **NextAuth (Auth.js)** | User sign-up, login, OAuth, sessions | Credentials + Google providers; Prisma adapter for users/sessions |
| **PostgreSQL** | Primary database | Users, watchlists, alerts, avatars (via Prisma) |
| **Prisma 7** | ORM + migrations | Type-safe queries for all app tables |
| **`pg` + `@prisma/adapter-pg`** | Postgres driver adapter | Prisma 7 driver adapter for Node/serverless connections |
| **CoinGecko API** | Market prices | Top-100 coins in a single API call per poll cycle |
| **Server-Sent Events (SSE)** | Push price updates to browser | Browser refetches `/api/prices` only when cache changes (~30s) |
| **In-memory cache** (`globalThis`) | Hot price store | Avoids hitting CoinGecko on every page load; one poll serves all users |
| **Lucide React** | Icons | Consistent icon set across sidebar, auth, and cards |

---

## 3. High-level architecture

```mermaid
flowchart TB
  subgraph Browser
    UI[Dashboard / Market / Watchlist / Alerts]
    SSE[EventSource /api/prices/stream]
    UI -->|fetch /api/prices| API
    SSE -->|prices-updated| UI
  end

  subgraph NextJS[Next.js on Vercel]
    MW[middleware.ts]
    API[API Routes]
    INST[instrumentation.ts]
    POLL[Market Poller setInterval]
    CACHE[(In-Memory Cache)]
    INST --> POLL
    POLL -->|every 30s| CG
    POLL --> CACHE
    API --> CACHE
    MW -->|session check| AUTH
  end

  subgraph External
    CG[CoinGecko API]
    AUTH[NextAuth]
    PG[(PostgreSQL)]
  end

  UI --> MW
  API --> PG
  POLL -->|flash crash| PG
  UI --> AUTH
```

**Request flow (simplified):**

1. User opens dashboard → **middleware** checks NextAuth session cookie.
2. UI connects to **SSE** and loads **cached prices** from `/api/prices`.
3. Background **poller** (started in `instrumentation.ts`) fetches CoinGecko every 30s.
4. New prices go into **memory cache** → SSE notifies browsers → UI refetches.
5. Large drops create **`CryptoAlert`** rows in Postgres.
6. Watchlist reads/writes **`Watchlist`** rows keyed by the local `User.id`.

---

## 4. Project structure

```
Crypto Sentry/
├── prisma/
│   ├── schema.prisma          # Watchlist + CryptoAlert models
│   └── migrations/            # SQL migration history
├── docker-compose.yml           # Local PostgreSQL
├── src/
│   ├── app/
│   │   ├── (app)/               # Protected dashboard (sidebar layout)
│   │   │   ├── page.tsx         # Home terminal
│   │   │   ├── market/          # Top-100 explorer
│   │   │   ├── watchlist/       # User watchlist
│   │   │   ├── alerts/          # Flash-crash feed
│   │   │   ├── profile/         # Name + avatar
│   │   │   └── settings/        # Browser-only preferences
│   │   ├── auth/                # Login, signup, verify, callback, signout
│   │   ├── api/                 # REST handlers (prices, watchlist, alerts, market)
│   │   ├── layout.tsx           # Root layout + global CSS
│   │   └── globals.css          # Theme tokens
│   ├── components/              # UI by feature (auth, dashboard, market, etc.)
│   ├── hooks/
│   │   └── use-live-prices.ts   # SSE + /api/prices client hook
│   ├── lib/
│   │   ├── db/                  # Prisma client + watchlist helpers
│   │   ├── market/              # Poller, cache, CoinGecko fetch, flash-crash
│   │   ├── auth/                # Email verified flag, profile helpers
│   │   ├── logger.ts            # Structured in-memory + console logs
│   │   └── coingecko.ts         # Server read API for cache
│   ├── middleware.ts            # Auth gate for all non-auth routes
│   └── instrumentation.ts       # Starts market poller on Node boot
├── .env.example                 # Required env template
├── prisma.config.ts             # Prisma 7 datasource config
└── next.config.ts               # Images (CoinGecko, Google)
```

---

## 5. Environment variables

Copy `.env.example` to `.env` locally. On Vercel, set the same keys in **Project → Settings → Environment Variables**.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string for Prisma |
| `DATABASE_POOL_MAX` | No | Max pool connections (default 2; raise for local Docker) |
| `AUTH_SECRET` | Yes | NextAuth session encryption secret |
| `AUTH_URL` / `NEXTAUTH_URL` | Yes | App base URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth credentials |
| `COINGECKO_API_BASE_URL` | Yes | e.g. `https://api.coingecko.com/api/v3` |
| `COINGECKO_MARKETS_PATH` | Yes | e.g. `/coins/markets` |
| `COINGECKO_API_KEY` | No | Empty = free tier; set for demo/pro API |
| `COINGECKO_API_TIER` | If key set | `demo` or `pro` (selects correct API header) |
| `MARKET_POLL_INTERVAL_MS` | No | Default 30000; minimum 30000 |
| `LOG_VERBOSE` | No | Set to `1` for debug-level logs |

**Local database:** Run `npm run db:up` to start PostgreSQL via Docker Compose, then `npx prisma migrate dev`.

---

## 6. Database — schema & where data lives

Prisma manages two app tables in the **`public`** schema:

### `Watchlist`

| Column | Type | Meaning |
|--------|------|---------|
| `id` | String (cuid) | Row primary key |
| `user_id` | String | Local `User.id` (FK) |
| `asset_id` | String | CoinGecko coin id (e.g. `bitcoin`) |
| `asset_name` | String | Display name |
| `added_at` | DateTime | When added |

Unique constraint: one row per `(user_id, asset_id)`.

### `CryptoAlert`

| Column | Type | Meaning |
|--------|------|---------|
| `id` | String (cuid) | Alert id |
| `asset_id` | String | CoinGecko id |
| `asset_name` | String | Coin name |
| `price_at_drop` | Float | Price when drop detected |
| `drop_percentage` | Float | % change vs previous poll |
| `detected_at` | DateTime | Timestamp |

Alerts are **global** (not per-user) — any flash crash is stored once.

### What is NOT in Postgres

| Data | Stored in |
|------|-----------|
| App settings (threshold, UI) | `UserSettings` table + browser `localStorage` for some UI prefs |
| Live coin prices | Server in-memory cache only |

### Viewing data

Use `npx prisma studio` or any PostgreSQL client. Main tables: `User`, `Watchlist`, `CryptoAlert`, `UserSettings`.

### Migrations

```bash
npx prisma migrate deploy    # Production — apply pending SQL
npx prisma migrate dev       # Local dev — create + apply migrations
npx prisma generate          # Regenerate client (also runs on npm postinstall)
```

---

## 7. Authentication

Auth is handled by **NextAuth (Auth.js)** with the **Prisma adapter**. User rows live in the `User` table; passwords are stored as bcrypt hashes in `password_hash`.

### Key files

| File | Purpose |
|------|---------|
| `src/auth.ts` | NextAuth config, Credentials + Google providers |
| `src/auth.config.ts` | Shared auth config for middleware |
| `src/lib/auth/session.ts` | `getSessionUser()` / `requireSessionUser()` |
| `src/middleware.ts` | Route protection via NextAuth session |

### Middleware gate (`src/middleware.ts`)

Runs on every request except static assets.

| Condition | Action |
|-----------|--------|
| No user + not on `/auth/*` | Redirect to `/auth/login?next=...` |
| Logged-in user on login/signup pages | Redirect to `/` |
| Unauthenticated API (except public routes) | `401 Unauthorized` |

### Sign-up flow (email + password)

```
User fills signup form → POST /api/auth/signup
    → bcrypt hash password → insert User row
    → signIn("credentials") → session cookie
```

### Login flow (email + password)

```
User submits login form → signIn("credentials", { email, password })
    → NextAuth authorize() verifies bcrypt hash
    → session cookie set → redirect to dashboard
```

### Google OAuth flow

```
User clicks "Sign in with Google"
    → signIn("google") via next-auth/react
    → Google → /api/auth/callback/google
    → Prisma adapter creates/links User + Account rows
```

Configure **Authorized redirect URI** in Google Cloud Console:  
`https://your-domain/api/auth/callback/google`

### Sign out

NextAuth `signOut()` from the UI, or session cleared via `/api/auth/signout`.

---

## 8. Market data pipeline

Prices are **not** stored in the database. They flow through an in-process pipeline.

### Step 1 — Poller starts on server boot

`src/instrumentation.ts` runs when the Node.js runtime starts:

```ts
ensureMarketPollerStarted()  // from src/lib/market/poller.ts
```

- Sets a `setInterval` (default every **30 seconds**, min 30s).
- Runs first poll immediately.
- Uses `globalThis` flags so only one poller runs per process.

**Why instrumentation?**  
Next.js hook to run code once per server instance — ideal for background polling without a separate worker process.

### Step 2 — Fetch from CoinGecko

`src/lib/market/coingecko-fetcher.ts`:

- One HTTP GET per cycle to `/coins/markets`.
- Params: `vs_currency=usd`, `per_page=100`, `order=market_cap_desc`, price changes for 1h/24h/7d.
- API key sent via `x-cg-demo-api-key` or `x-cg-pro-api-key` based on `COINGECKO_API_TIER`.
- On **429**, enters a **120s cooldown** (`coingecko-fallback.ts`).

### Step 3 — Refresh logic

`src/lib/market/refresh-prices.ts`:

1. Skip if rate-limit cooldown active → serve stale cache.
2. Save current prices as **baseline** for flash-crash comparison.
3. Fetch new top-100 from CoinGecko.
4. On error, keep stale cache if any coins exist.
5. Run `detectFlashCrashes()` (see section 9).
6. `updateMarketCache()` with `source: "live"`.
7. Log success to console + in-memory log buffer.

### Step 4 — Memory cache

`src/lib/market/memory-cache.ts` stores coins + metadata on `globalThis.__cryptoSentryMarketCache`.

| Meta field | Meaning |
|------------|---------|
| `updatedAt` | Last successful price write |
| `stale` | True if empty or older than 90s |
| `source` | `live` \| `stale` \| `empty` |
| `pollCycle` | Number of poll iterations |
| `lastError` | Last fetch error message |

### Step 5 — Notify browsers (SSE)

`src/lib/market/cache-events.ts` increments a **cache version** and notifies listeners.

`GET /api/prices/stream` (authenticated):

- Opens SSE connection.
- Sends `connected` event with current version.
- On each cache update → `prices-updated` event.
- Heartbeat every 45s.

### Step 6 — UI loads prices

`src/hooks/use-live-prices.ts`:

1. `fetch("/api/prices")` on mount.
2. `EventSource("/api/prices/stream")` listens for `prices-updated`.
3. When version changes → refetch `/api/prices`.

`GET /api/prices` and `GET /api/market` only **read the cache** — they never call CoinGecko directly.

**Why SSE + cache instead of polling from the browser?**  
One CoinGecko call every 30s on the server serves all users. Browsers only refetch when data actually changes.

---

## 9. Flash-crash detection & alerts

`src/lib/market/flash-crash.ts` runs after each successful price fetch.

### Algorithm

For each coin in the new snapshot:

1. Compare `current_price` to **previous poll baseline**.
2. If drop ≤ **-2%** (default threshold), consider an alert.
3. **Cooldown:** max one alert per coin per **60 seconds**.
4. Insert row into `CryptoAlert` via Prisma.
5. Log: `ALERT: Bitcoin fell X% to $Y`.

### Severity (UI only)

`src/app/api/alerts/route.ts` maps drop % to severity:

| Drop % | Severity |
|--------|----------|
| ≤ -8% | `critical` |
| ≤ -5% | `high` |
| > -5% | `medium` |

### Alerts UI

- **`/alerts`** — full feed via `AlertsFeed` component.
- **Home dashboard** — shows last 10 alerts summary.
- Data from `GET /api/alerts?limit=N`.

---

## 10. Watchlist

### Add / remove (Market page)

`MarketExplorer` component:

- `GET /api/watchlist` — list user's asset ids + live prices from cache.
- `POST /api/watchlist` — body: `{ assetId, assetName }` → Prisma upsert.
- `DELETE /api/watchlist/[assetId]` — remove row.

`user_id` references the local `User.id` (foreign key).

### Watchlist page

`/watchlist` → `WatchlistView` — table of saved coins with live prices and remove action.

### Server helpers

`src/lib/db/watchlist.ts` — Prisma queries isolated from API routes.

---

## 11. Profile & avatars

`/profile` (server component) loads session user and passes props to `ProfileView`.

### Display name

- From `User.name`, or email prefix, or `"Operative"`.

### Update name

`PATCH /api/user/profile` updates the `User.name` column.

### Avatar upload

1. Validate file (JPEG/PNG/WebP/GIF, max 2 MB).
2. `POST /api/user/avatar` saves bytes to `User.avatar_data` / `avatar_mime`.
3. `User.image` is set to `/api/avatars/{userId}`.
4. `GET /api/avatars/{userId}` serves the image from PostgreSQL (public route).

Google OAuth users keep their external `image` URL until they upload a custom avatar.

---

## 12. Settings

`/settings` → `SettingsView` stores preferences in **browser localStorage** only:

| Key | Default | Purpose |
|-----|---------|---------|
| `alertThreshold` | -2 | Display preference (detection uses server default -2%) |
| `aggressivePolling` | false | UI flag (poller interval is server env) |
| `uiDensity` | compact | Layout density |
| `emailReports` | true | Placeholder preference |

**Note:** A `UserSettings` table exists in an old migration but is **not** wired to the current UI or Prisma schema.

---

## 13. API routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/prices` | GET | No* | Cached top-100 coins + meta |
| `/api/prices/stream` | GET | Yes | SSE price update stream |
| `/api/market` | GET | No | Same cache; optional `?ids=bitcoin,ethereum` |
| `/api/market/status` | GET | No | Health meta; `?logs=1` for recent server logs |
| `/api/alerts` | GET | No | Latest `CryptoAlert` rows; `?limit=50` |
| `/api/watchlist` | GET, POST | Yes | List or add watchlist items |
| `/api/watchlist/[assetId]` | DELETE | Yes | Remove one asset |
| `/auth/callback` | GET | — | OAuth code exchange |
| `/auth/signout` | POST | — | Clear session |

\*Price endpoints are public; dashboard pages still require login via middleware.

All live market responses use `Cache-Control: no-store` (`jsonLive` helper).

---

## 14. Logging & debugging

### Server logs (`src/lib/logger.ts`)

- Writes to **console** (`console.log/warn/error`).
- Keeps last **200** entries in memory on `globalThis`.
- `LOG_VERBOSE=1` enables debug lines.

### Where to view logs

| Environment | Location |
|-------------|----------|
| Local `npm run dev` | Terminal running the dev server |
| Vercel production | Project → **Logs** (runtime logs) |
| In-app market logs | `GET /api/market/status?logs=1` |
| Auth issues | Check NextAuth logs in Vercel runtime / server console |

### Database inspection

- `npx prisma studio` or connect to `DATABASE_URL` with any Postgres client

---

## 15. Deployment (Vercel + PostgreSQL)

### Vercel

1. Import GitHub repo `Crypto-Sentry`.
2. Framework: **Next.js** (auto-detected).
3. Provision PostgreSQL (Neon, Railway, Vercel Postgres, etc.) and set `DATABASE_URL`.
4. Add all env vars from `.env.example`.
5. Deploy.

Build runs `prisma generate` + `prisma migrate deploy` + `next build` via `npm run build`.

### Google OAuth production config

| Setting | Value |
|---------|-------|
| Authorized redirect URI | `https://your-app.vercel.app/api/auth/callback/google` |

### After first deploy

1. Confirm migrations applied (`prisma migrate deploy` runs on build).
2. Test sign-up and login (incognito) on the production URL.

---

## 16. Commands & common tasks

```bash
# Development
npm install
npm run db:up                 # start local PostgreSQL (Docker)
cp .env.example .env          # fill in DATABASE_URL + auth secrets
npx prisma migrate dev          # apply migrations locally
npm run dev                   # http://localhost:3000

# Production build (local test)
npm run build
npm run start

# Database
npx prisma migrate deploy     # production migrations
npx prisma studio             # GUI for Postgres tables

# Lint
npm run lint
```

### Common issues

| Problem | Fix |
|---------|-----|
| `DATABASE_URL` connection refused | Start Postgres (`npm run db:up`) or check hosted DB credentials |
| Missing tables | Run `npx prisma migrate deploy` on production DB |
| Google login fails | Match redirect URI in Google Console to `AUTH_URL` + `/api/auth/callback/google` |
| Empty prices on first load | Wait ~30s for poller; check `/api/market/status?logs=1` |
| CoinGecko 429 | Automatic 120s cooldown; shows stale cache |

---

## 17. Known limitations on serverless

Because Vercel runs **short-lived serverless instances**:

1. **In-memory cache is per-instance** — different users may briefly see different cache ages during cold starts.
2. **Poller `setInterval` only runs while an instance is warm** — idle instances stop polling until the next request wakes them.
3. **SSE connections** may drop when instances recycle; the client reconnects on next page load.
4. **Flash-crash baseline** resets on cold start — first poll after boot has no previous baseline for comparison.

For a demo or small deployment this is acceptable. For production scale, consider shared cache (Redis/Upstash) or Vercel Cron to hit a dedicated refresh endpoint.

---

## End-to-end example: user adds Bitcoin to watchlist

```
1. User logs in → NextAuth session cookie set → middleware allows /market
2. Market page loads → useLivePrices() → GET /api/prices (cache) + SSE connect
3. User clicks star on Bitcoin → POST /api/watchlist { assetId: "bitcoin", assetName: "Bitcoin" }
4. API reads session → user.id → Prisma upsert into Watchlist
5. User opens /watchlist → GET /api/watchlist → joins DB rows with cached prices
6. Meanwhile every 30s: poller → CoinGecko → cache update → SSE → UI refreshes prices
7. If BTC drops >2% vs last poll → CryptoAlert row created → visible on /alerts
```

---

*Last updated to match the codebase as of June 2026. For a quick folder map, see `FOLDER_STRUCTURE.md`.*
