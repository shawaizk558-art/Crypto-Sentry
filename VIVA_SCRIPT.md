# Crypto Sentry — Complete Viva Script

Use this document as your spoken script and revision guide. Read each section aloud until you can explain it without notes.

---

## Part 1: Opening Introduction (30–60 seconds)

**What to say:**

> "Good morning/afternoon. My project is **Crypto Sentry** — a real-time cryptocurrency market monitoring dashboard built with **Next.js 15**, **React 19**, **TypeScript**, **PostgreSQL**, and **NextAuth (Auth.js v5)**.
>
> The app tracks the **top 100 cryptocurrencies** by market cap using the **CoinGecko API**. It displays live prices, lets users build a personal **watchlist**, and automatically detects **flash crashes** — sudden price drops between poll cycles — and saves **per-user alerts** in the database.
>
> The UI follows a **cyber/terminal command-center** aesthetic with a sidebar navigation, dark theme, and real-time status indicators."

**Project name in package.json:** `crypto-sentry`  
**Dev server port:** `3000` (`npm run dev` → `next dev -p 3000`)

---

## Part 2: Problem Statement & Objectives

**What to say:**

> "Cryptocurrency markets are highly volatile. A coin can drop several percent in minutes. Traders and investors need a tool that:
> 1. Shows **live market data** without refreshing the page manually
> 2. Lets them **track specific coins** in a watchlist
> 3. **Alerts them automatically** when a coin drops sharply — a flash crash
> 4. Supports **multiple users**, each with their own settings and alerts
>
> Crypto Sentry solves this by polling CoinGecko once every 60 seconds server-side, caching prices in memory, pushing updates to the browser via **Server-Sent Events (SSE)**, and comparing each poll against the previous poll to detect sudden drops."

---

## Part 3: Technology Stack (Know Every Item)

| Layer | Technology | Version | Why we chose it |
|-------|-----------|---------|-----------------|
| Framework | Next.js (App Router) | 15.5.x | Full-stack React, API routes, middleware, SSR |
| UI | React | 19.2.x | Component-based UI |
| Language | TypeScript | 6.x | Type safety |
| Styling | Tailwind CSS | 4.x | Utility-first, cyber theme |
| Auth | NextAuth / Auth.js | v5 beta | Industry-standard OAuth + credentials |
| ORM | Prisma | 7.8.x | Type-safe database access |
| Database driver | `@prisma/adapter-pg` + `pg` | 7.8 / 8.21 | Prisma 7 Postgres adapter |
| Password hashing | bcrypt | 6.x | Secure one-way password storage |
| Icons | lucide-react | 1.17.x | UI icons |
| External API | CoinGecko REST API | — | Free/pro crypto market data |
| Database | PostgreSQL | — | Relational storage (e.g. Supabase hosted) |

**npm scripts:**
- `dev` — development server on port 3000
- `build` — production build
- `start` — run production server
- `lint` — ESLint
- `postinstall` — runs `prisma generate` automatically after `npm install`

---

## Part 4: Environment Variables (COMPLETE — Examiner Will Ask)

Copy [`.env.example`](.env.example) to `.env` and fill every value. **Never commit `.env` to git.**

### 4.1 Database

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| **`DATABASE_URL`** | **Yes** | `postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres` | PostgreSQL connection string. Used by Prisma at runtime ([`src/lib/db/prisma.ts`](src/lib/db/prisma.ts)) and migrations ([`prisma.config.ts`](prisma.config.ts)). App throws error if missing. |
| **`DIRECT_URL`** | Optional | `postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres` | Direct Postgres host (bypasses connection pooler). **Not wired in code** — only used manually if `prisma migrate` fails through the pooler. Swap into `DATABASE_URL` temporarily for migrations. |

**Viva answer:** "We use Supabase as PostgreSQL host. The pooler URL works for the running app; direct URL is a fallback for migrations."

### 4.2 Authentication (NextAuth / Auth.js)

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| **`AUTH_SECRET`** | **Yes** | Generate with `openssl rand -base64 32` | Secret key used to **sign and encrypt JWT session tokens**. Auth.js reads this automatically — not referenced explicitly in our code. Without it, sessions are insecure. |
| **`NEXTAUTH_SECRET`** | Legacy alias | Same as above | Old name for `AUTH_SECRET`; still supported by Auth.js |
| **`AUTH_URL`** | **Yes** | `http://localhost:3000` | Canonical base URL of the app. Auth.js uses it for OAuth callbacks and CSRF. In production: `https://yourdomain.com` |
| **`NEXTAUTH_URL`** | Legacy alias | Same as above | Old name for `AUTH_URL` |

**Viva answer:** "AUTH_SECRET is like a master password for our session tokens. If someone steals it, they can forge sessions. We generate it with OpenSSL and never expose it to the browser."

### 4.3 Google OAuth

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| **`GOOGLE_CLIENT_ID`** | Optional | From Google Cloud Console | OAuth 2.0 Client ID. Google Sign-In only works when **both** ID and secret are set. |
| **`GOOGLE_CLIENT_SECRET`** | Optional | From Google Cloud Console | OAuth 2.0 Client Secret |

**Setup steps to explain:**
1. Go to **Google Cloud Console → APIs & Services → Credentials**
2. Create **OAuth 2.0 Client ID** (Web application)
3. Add **Authorized redirect URI:** `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret into `.env`

**Code behavior** ([`src/auth.ts`](src/auth.ts)): Google provider is registered only when both env vars exist:

```typescript
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(Google({ clientId: ..., clientSecret: ... }));
}
```

**Viva answer:** "Google OAuth is optional. If env vars are empty, only email/password login works."

### 4.4 CoinGecko API

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| **`MARKET_POLL_INTERVAL_MS`** | No | `60000` (60 sec) | How often the server polls CoinGecko. **Minimum enforced: 60000ms** in [`poller.ts`](src/lib/market/poller.ts) to respect rate limits. |
| **`COINGECKO_API_BASE_URL`** | **Yes** | `https://api.coingecko.com/api/v3` | Base URL for CoinGecko API. App throws if missing. |
| **`COINGECKO_MARKETS_PATH`** | **Yes** | `/coins/markets` | Markets endpoint path |
| **`COINGECKO_API_KEY`** | No | empty | API key for demo or pro tier. If empty, requests go without auth header (free tier, stricter rate limits). |
| **`COINGECKO_API_TIER`** | If key set | `demo` or `pro` | `demo` → sends header `x-cg-demo-api-key`; `pro` → sends `x-cg-pro-api-key` |

**Viva answer:** "We make exactly **one CoinGecko API call per poll cycle** for the top 100 coins. The result is stored in server memory — the UI never calls CoinGecko directly."

### 4.5 Other

| Variable | Required | Purpose |
|----------|----------|---------|
| **`LOG_VERBOSE`** | No | Set to `"1"` to enable debug logging in [`src/lib/logger.ts`](src/lib/logger.ts) |
| **`NODE_ENV`** | Auto | `production` vs `development` — affects Prisma singleton caching |
| **`NEXT_RUNTIME`** | Auto | [`instrumentation.ts`](src/instrumentation.ts) starts poller only when value is `"nodejs"` (not Edge) |

### 4.6 Environment Variables Flashcards (Study Aid)

| Variable | One-line answer |
|----------|-----------------|
| `DATABASE_URL` | Postgres connection string for Prisma runtime + migrations |
| `DIRECT_URL` | Direct Postgres URL; manual fallback when pooler breaks migrations |
| `AUTH_SECRET` | Signs/encrypts JWT session cookies (`openssl rand -base64 32`) |
| `AUTH_URL` | App base URL for OAuth callbacks and CSRF |
| `GOOGLE_CLIENT_ID` | Google OAuth public client identifier |
| `GOOGLE_CLIENT_SECRET` | Google OAuth private secret (paired with client ID) |
| `MARKET_POLL_INTERVAL_MS` | CoinGecko poll interval in ms (min 60000) |
| `COINGECKO_API_BASE_URL` | CoinGecko API root URL (required) |
| `COINGECKO_MARKETS_PATH` | Markets endpoint path e.g. `/coins/markets` (required) |
| `COINGECKO_API_KEY` | Optional API key for demo/pro tier |
| `COINGECKO_API_TIER` | `demo` or `pro` — picks which API key header to send |
| `LOG_VERBOSE` | Set `"1"` to enable verbose server logs |

---

## Part 5: Project Folder Structure

```
Crypto Sentry/
├── prisma/
│   ├── schema.prisma          # Database models
│   └── migrations/            # 9 migration files (schema evolution)
├── src/
│   ├── auth.config.ts         # Edge-safe auth config (middleware)
│   ├── auth.ts                # Full auth + providers + Prisma adapter
│   ├── middleware.ts          # Route protection
│   ├── instrumentation.ts     # Starts market poller on server boot
│   ├── app/
│   │   ├── (app)/             # Protected pages (dashboard, market, etc.)
│   │   ├── auth/              # Login/signup pages
│   │   └── api/               # REST + SSE API routes
│   ├── components/            # React UI components
│   ├── hooks/                 # useLivePrices (SSE client hook)
│   ├── lib/                   # Business logic (market, auth, db)
│   └── types/                 # TypeScript type definitions
├── .env.example               # Environment template
├── next.config.ts             # Next.js config
├── prisma.config.ts           # Prisma 7 datasource config
└── package.json
```

**Path alias:** `@/*` maps to `./src/*` (configured in `tsconfig.json`)

---

## Part 6: Database Schema (All 7 Models)

**Provider:** PostgreSQL via Prisma 7 ([`prisma/schema.prisma`](prisma/schema.prisma))

```mermaid
erDiagram
  User ||--o{ Account : has
  User ||--o{ Session : has
  User ||--o| UserSettings : has
  User ||--o{ Watchlist : has
  User ||--o{ CryptoAlert : has
```

### Model details to memorize:

**User** — Core identity
- `id` (cuid, primary key)
- `email` (unique, required)
- `name`, `image` (optional)
- `password_hash` (optional — null for Google-only users)
- `onboarding_completed` (boolean, default false)
- `created_at`

**UserSettings** — 1:1 with User
- `user_id` (primary key, FK to User)
- `alert_threshold` (Float, default **-2.0**) — flash crash sensitivity in %
- `ui_density` (String, default **"compact"**) — `"compact"` or `"expanded"`
- `updated_at`

**Account** — OAuth provider accounts (NextAuth)
- Links Google (or other) accounts to User
- `provider` + `providerAccountId` (unique together)
- Stores OAuth tokens

**Session** — Database sessions (NextAuth adapter)
- Note: app uses **JWT strategy**, but adapter still creates Account/Session tables

**VerificationToken** — Email verification (NextAuth standard table)

**Watchlist** — Per-user tracked coins
- `user_id` + `asset_id` (unique together — can't add same coin twice)
- `asset_name`, `added_at`
- Index on `user_id`

**CryptoAlert** — Per-user flash crash records
- `user_id`, `asset_id`, `asset_name`
- `price_at_drop`, `drop_percentage`
- `detected_at`
- Indexes on `user_id` and `(user_id, detected_at)`

### Migration history (show you understand evolution):
1. **init** — User, Watchlist, CryptoAlert (alerts were global, no user_id)
2. **auth_and_2fa** — NextAuth tables + 2FA fields (2FA removed later)
3. **user_settings** — UserSettings table
4. **nextauth_user** — Rebuilt User for NextAuth migration
5. **user_onboarding** — `onboarding_completed` flag
6. **simplify_user_settings** — Removed `aggressive_polling`, `email_reports`
7. **per_user_alerts** — Added `user_id` to CryptoAlert (alerts now per-user)

**Viva answer:** "Alerts were originally global. We migrated to per-user alerts so each user's threshold creates their own alert rows."

---

## Part 7: Authentication (Deep Dive)

### 7.1 Architecture: Two-file split for Edge compatibility

| File | Runs where | Contains |
|------|-----------|----------|
| [`auth.config.ts`](src/auth.config.ts) | Edge (middleware) | JWT strategy, callbacks, custom pages — **no Prisma** |
| [`auth.ts`](src/auth.ts) | Node.js server | Prisma adapter, Credentials + Google providers |

**Why two files?** Middleware runs on Edge runtime where Prisma/database cannot run. Middleware only needs JWT verification, not database queries.

### 7.2 Session strategy: JWT

```typescript
session: { strategy: "jwt" }
```

- Session stored as **signed JWT cookie** (not database session lookup on every request)
- JWT callback copies `user.id` into token
- Session callback copies `token.id` into `session.user.id`

### 7.3 Login methods

**A) Email + Password (Credentials provider)**
1. User submits email/password on `/auth/login`
2. `signIn("credentials", { email, password, redirect: false })` called from [`login-form.tsx`](src/components/auth/login-form.tsx)
3. NextAuth calls `authorize()` in [`auth.ts`](src/auth.ts):
   - Find user by email in PostgreSQL
   - Verify `password_hash` with bcrypt `compare`
   - Return user object or `null`
4. On success: JWT created, cookie set, redirect to `next` param or `/`

**B) Signup (separate from NextAuth)**
1. User submits on `/auth/signup`
2. `POST /api/auth/signup` ([`signup/route.ts`](src/app/api/auth/signup/route.ts)):
   - Validates email format (regex)
   - Password minimum **6 characters**
   - Returns **409** if email exists
   - Hashes password with bcrypt, creates User row
   - Default `name` = email prefix before `@`
3. User then logs in via credentials

**C) Google OAuth (optional)**
1. User clicks Google button → `signIn("google", { callbackUrl: "/" })`
2. Redirects to Google consent screen
3. Google redirects to `/api/auth/callback/google`
4. NextAuth creates/links User + Account in database via PrismaAdapter

### 7.4 Middleware protection ([`middleware.ts`](src/middleware.ts))

**Public (no login required):**
- `/auth/login`, `/auth/signup`, `/login`, `/signup`
- `/api/auth/*`, `/api/prices/*`, `/api/market/*`

**Protected (login required):**
- All `(app)` pages: `/`, `/market`, `/watchlist`, `/alerts`, `/settings`, `/profile`
- APIs: `/api/watchlist`, `/api/alerts`, `/api/user/*`
- `/api/prices/stream` — middleware allows it, but route itself returns **401** without session

**Behavior:**
- Unauthenticated user on protected page → redirect to `/auth/login?next=<original-path>`
- Authenticated user on login/signup → redirect to `/`

### 7.5 Server-side session helpers ([`session.ts`](src/lib/auth/session.ts))
- `getSessionUser()` — returns full user from DB or `null`
- `requireSessionUser()` — throws `"Unauthorized"` if no session (API routes catch this → 401)

### 7.6 Auth Flow Diagram (Practice Drawing This)

```mermaid
sequenceDiagram
  participant User as Browser
  participant MW as middleware.ts
  participant NA as NextAuth
  participant DB as PostgreSQL

  User->>MW: GET /watchlist
  MW->>MW: Verify JWT cookie
  alt Not logged in
    MW-->>User: Redirect /auth/login?next=/watchlist
    User->>NA: signIn credentials
    NA->>DB: Find user + verify bcrypt
    NA-->>User: Set JWT cookie
    User->>MW: GET /watchlist
  end
  MW-->>User: Allow page load
```

---

## Part 8: Market Data Pipeline (Core Feature — Draw This)

```mermaid
sequenceDiagram
  participant Boot as instrumentation.ts
  participant Poller as poller.ts
  participant CG as CoinGecko API
  participant FC as flash-crash.ts
  participant Cache as memory-cache
  participant DB as PostgreSQL
  participant SSE as /api/prices/stream
  participant Browser as useLivePrices hook

  Boot->>Poller: ensureMarketPollerStarted()
  loop Every 60 seconds
    Poller->>CG: GET /coins/markets (top 100)
    CG-->>Poller: JSON price data
    Poller->>FC: detectFlashCrashes(new, previousBaseline)
    FC->>DB: INSERT CryptoAlert per user
    Poller->>Cache: updateMarketCache()
    Cache->>SSE: notifyPriceCacheUpdated()
  end
  Browser->>SSE: EventSource connect
  SSE-->>Browser: prices-updated event
  Browser->>Cache: GET /api/prices (read cache)
```

### Step-by-step explanation:

**1. Server boot** — [`instrumentation.ts`](src/instrumentation.ts)
- Next.js calls `register()` on Node.js startup
- Starts `ensureMarketPollerStarted()` only when `NEXT_RUNTIME === "nodejs"`

**2. Poller** — [`poller.ts`](src/lib/market/poller.ts)
- Interval: `MARKET_POLL_INTERVAL_MS` (default 60,000ms, minimum 60s)
- Prevents overlapping polls with `__marketPollInFlight` flag
- Each cycle calls `refreshPricesFromApi()`

**3. CoinGecko fetch** — [`coingecko-fetcher.ts`](src/lib/market/coingecko-fetcher.ts)
- **One API call** per cycle
- Params: `vs_currency=usd`, `order=market_cap_desc`, `per_page=100`, `price_change_percentage=1h,24h,7d`
- 20-second timeout
- On **HTTP 429** (rate limit): triggers 120-second cooldown ([`coingecko-fallback.ts`](src/lib/market/coingecko-fallback.ts))

**4. Flash crash detection** — [`flash-crash.ts`](src/lib/market/flash-crash.ts) (see Part 9)

**5. Memory cache** — [`memory-cache.ts`](src/lib/market/memory-cache.ts)
- Global singleton on `globalThis.__cryptoSentryMarketCache`
- Data marked **stale** if older than **90 seconds**
- On update: bumps `cacheVersion` and notifies SSE subscribers

**6. Client updates** — [`use-live-prices.ts`](src/hooks/use-live-prices.ts)
- On mount: `GET /api/prices` (reads cache, no CoinGecko call)
- Opens `EventSource("/api/prices/stream")` (requires auth cookie)
- On `prices-updated` with new version → refetches `/api/prices`
- Ignores `heartbeat` events (sent every 45 seconds to keep connection alive)

**Viva answer:** "SSE does not send price data. It only sends a signal that cache updated. The browser then fetches fresh prices from `/api/prices`. This keeps one CoinGecko call per cycle shared across all users."

---

## Part 9: Flash Crash Detection Algorithm

**File:** [`src/lib/market/flash-crash.ts`](src/lib/market/flash-crash.ts)

### What is a flash crash in our app?
A **poll-to-poll price drop** — not the 24-hour change from CoinGecko.

### Formula:
```
dropPct = ((current_price - previous_poll_price) / previous_poll_price) × 100
```

### Algorithm:
1. Load all users and their `alert_threshold` (default **-2%**)
2. For each of top 100 coins:
   - Get previous poll baseline price from `__marketPreviousBaseline` Map
   - Calculate `dropPct`
   - For each user where `dropPct <= threshold` (e.g. -3% <= -2%):
     - Check **60-second cooldown** per `(userId, assetId)` — prevents duplicate alerts
     - Insert `CryptoAlert` row in database
3. Update baseline to current prices for next cycle

### Alert severity (computed in API, not stored):
| Drop % | Severity |
|--------|----------|
| ≤ -8% | critical |
| ≤ -5% | high |
| else | medium |

### Important distinction for viva:
- **Flash crash alerts** = poll-to-poll drop vs user's `alert_threshold`
- **Dashboard "ALERT" badge on BTC/ETH cards** = 24h change ≤ -2% (visual only, separate logic)
- Flash crash scans **all top 100 coins** for **every user** — not limited to watchlist

---

## Part 10: All Pages & Features

### Protected app pages (`src/app/(app)/`)

| Route | Component | What it does |
|-------|-----------|--------------|
| `/` | `TerminalHome` | Main dashboard — BTC/ETH cards, market overview, alert widget, analytics |
| `/market` | `MarketExplorer` | Searchable table of top 100 coins; star to add/remove watchlist |
| `/watchlist` | `WatchlistView` | User's saved coins with live prices; remove button |
| `/alerts` | `AlertsFeed` | User's flash crash history with severity badges |
| `/settings` | `SettingsView` | Alert threshold slider (-10% to 0%); UI density toggle |
| `/profile` | `ProfileView` | Edit name, upload avatar (max 2MB), account info |

### Auth pages
| Route | Purpose |
|-------|---------|
| `/auth/login` | Email/password + Google sign-in |
| `/auth/signup` | Create account |
| `/login`, `/signup` | Redirect aliases to `/auth/*` |

### App shell ([`(app)/layout.tsx`](src/app/(app)/layout.tsx))
- `CyberBackground` — animated background
- `Sidebar` — navigation + sign out
- `TopBar` — header bar
- `UiDensityProvider` — loads `ui_density` from settings
- `OnboardingHost` — first-time user tour if `onboarding_completed` is false

### Dashboard highlights (`TerminalHome`)
- Status banners: syncing (empty cache), stale warning (>90s old)
- BTC price pulse animation on price change
- Synthetic sparklines (derived from 24h %, not real OHLC history)
- Sentiment indicator: BULLISH / BEARISH / NEUTRAL from avg 24h change
- Volatility index and count of assets down 24h

### Settings that affect behavior
| Setting | Storage | Effect |
|---------|---------|--------|
| `alert_threshold` | `UserSettings` table | How sensitive flash crash detection is |
| `ui_density` | `UserSettings` table | `compact` vs `expanded` layout via CSS `data-ui-density` |

### Known UI limitations (honest viva answers)
- Alerts "Filter" button has no logic wired
- TopBar search is decorative only
- Sparklines are synthetic, not real price history
- `WatchlistTable` component exists but is unused (cards used instead)

---

## Part 11: All API Endpoints

### Public APIs (no login)

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handlers (session, OAuth callbacks) |
| POST | `/api/auth/signup` | Create user `{ email, password }` |
| GET | `/api/prices` | Full cache snapshot `{ coins, meta }` |
| GET | `/api/market` | Same as prices; optional `?ids=bitcoin,ethereum` |
| GET | `/api/market/status` | Poller health, cache meta; `?logs=1` for debug |

### Protected APIs (session required → 401 if missing)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/prices/stream` | SSE stream: `connected`, `prices-updated`, `heartbeat` |
| GET | `/api/alerts?limit=50` | User's alerts (max limit 100) |
| GET | `/api/watchlist` | Watchlist enriched with live prices |
| POST | `/api/watchlist` | Add coin `{ assetId, assetName }` |
| DELETE | `/api/watchlist/[assetId]` | Remove coin |
| GET | `/api/user/settings` | Get/create settings |
| PATCH | `/api/user/settings` | Update `alert_threshold`, `ui_density` |
| PATCH | `/api/user/profile` | Update `name` |
| POST | `/api/user/avatar` | Upload image (JPEG/PNG/WebP/GIF, max 2MB) → `public/uploads/avatars/` |
| PATCH | `/api/user/onboarding` | Set `onboarding_completed: true` |
| POST | `/auth/signout` | Sign out, redirect to login |

### API response meta shape:
```json
{
  "coins": [...],
  "meta": {
    "updatedAt": "ISO timestamp",
    "stale": false,
    "source": "live",
    "ageMs": 12345,
    "serverPollIntervalMs": 60000,
    "cacheVersion": 42,
    "coinCount": 100
  }
}
```

---

## Part 12: Security Measures

Explain these if asked:

1. **Passwords** — bcrypt hashed, never stored plain text; `password_hash` nullable for OAuth-only users
2. **Sessions** — JWT signed with `AUTH_SECRET`; HTTP-only cookie
3. **Middleware** — blocks unauthenticated access to app pages and user APIs
4. **API authorization** — `requireSessionUser()` on sensitive routes; users only see their own alerts/watchlist
5. **Avatar upload** — file type validation, 2MB size limit, saved as `{userId}.{ext}` locally
6. **Rate limiting** — 60s minimum poll interval; 120s cooldown after CoinGecko 429
7. **Env secrets** — `.env` in `.gitignore`; `.env.example` has placeholders only
8. **SQL injection** — Prisma parameterized queries
9. **Edge/Node split** — no database access in middleware

---

## Part 13: Demo Flow (Practice This Live)

### Setup commands
```bash
npm install
cp .env.example .env   # then fill all values
npx prisma migrate deploy
npm run dev
```

### Demo checklist

| Step | Action | What to point out |
|------|--------|-------------------|
| 1 | Open `http://localhost:3000` | Redirect to login if not authenticated |
| 2 | `/auth/signup` → create account → login | bcrypt hashing, email validation, min 6 char password |
| 3 | Complete onboarding tour | `onboarding_completed` flag |
| 4 | Dashboard `/` | Live prices, SSE connected indicator, poll interval in header |
| 5 | `/market` → search "bitcoin" → star icon | Watchlist POST API |
| 6 | `/watchlist` | Merged DB + live cache data |
| 7 | `/settings` → threshold -1% → Save | Per-user flash crash sensitivity |
| 8 | `/alerts` | Per-user `CryptoAlert` rows with severity |
| 9 | `/profile` → edit name, upload avatar | Local file storage in `public/uploads/avatars/` |
| 10 | Google login (if configured) | OAuth callback at `/api/auth/callback/google` |
| 11 | Open `/api/market/status` | Poller health, cache meta, coin count |

---

## Part 14: Anticipated Viva Questions & Answers

**Q: Why not call CoinGecko from the browser?**  
A: Rate limits. One server poll serves all users. API key stays secret on server. Consistent data for flash crash detection.

**Q: Why SSE instead of WebSockets?**  
A: One-way server→client push is sufficient. SSE is simpler, works over HTTP, auto-reconnects. We only need to signal "cache updated."

**Q: Why JWT instead of database sessions?**  
A: Faster — no DB lookup per request. Middleware on Edge can verify JWT without Prisma. PrismaAdapter still stores OAuth Account data.

**Q: What happens if CoinGecko is down?**  
A: Cache marked `stale`, old prices kept. UI shows stale warning banner. No new flash crash alerts until fresh data arrives.

**Q: What is AUTH_SECRET?**  
A: Cryptographic secret for signing session tokens. Generated with `openssl rand -base64 32`. Must be unique per deployment.

**Q: What is GOOGLE_CLIENT_ID?**  
A: Public identifier from Google Cloud Console for OAuth. Paired with GOOGLE_CLIENT_SECRET. Redirect URI must match exactly.

**Q: Difference between DATABASE_URL and DIRECT_URL?**  
A: DATABASE_URL uses Supabase connection pooler (good for app). DIRECT_URL connects directly to Postgres (needed sometimes for migrations).

**Q: How are alerts per-user?**  
A: `CryptoAlert` has `user_id` FK. Detection loop creates one row per user whose threshold is breached. Each user sets their own `alert_threshold` in settings.

**Q: Why 60 second poll interval?**  
A: CoinGecko free tier rate limits. One call per minute for 100 coins is efficient. Minimum hardcoded to prevent accidental API abuse.

**Q: What is Prisma adapter for pg?**  
A: Prisma 7 uses driver adapters. We use `@prisma/adapter-pg` with `pg` Pool instead of Prisma's built-in engine connection.

**Q: What runs on Edge vs Node?**  
A: Middleware (auth check) = Edge. Poller, Prisma, bcrypt, file uploads = Node only.

**Q: Is 2FA implemented?**  
A: No. Migration history shows 2FA was planned and removed. Current auth is credentials + optional Google only.

**Q: Why in-memory cache instead of Redis?**  
A: Simplicity for this project scope. Single server instance. Cache rebuilds every 60s. Trade-off: data lost on server restart until next poll.

**Q: How does flash crash differ from 24h change?**  
A: Flash crash compares current poll to previous poll (minutes apart). 24h change is CoinGecko's rolling 24-hour percentage.

---

## Part 15: Closing Statement

> "Crypto Sentry demonstrates a full-stack real-time monitoring application: secure multi-user authentication with NextAuth, efficient market data ingestion with server-side polling and in-memory caching, push-based UI updates via SSE, and automated per-user flash crash detection persisted in PostgreSQL. The architecture prioritizes API rate limit compliance, security of secrets and sessions, and a responsive cyber-themed user experience."

---

## Quick Reference Card (Memorize These Numbers)

| Item | Value |
|------|-------|
| Poll interval | 60 seconds (min) |
| Coins tracked | Top 100 by market cap |
| Cache stale after | 90 seconds |
| Alert cooldown | 60 seconds per user+coin |
| Default alert threshold | -2% |
| Password min length | 6 characters |
| Avatar max size | 2 MB |
| SSE heartbeat | every 45 seconds |
| Rate limit cooldown | 120 seconds after HTTP 429 |
| Dev port | 3000 |
| Google callback URL | `/api/auth/callback/google` |
