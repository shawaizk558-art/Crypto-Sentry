# Crypto Sentry — Folder Structure

Quick map of the repo so you know where everything lives.

```
Crypto Sentry/
├── prisma/                    # Database schema & migrations
│   ├── schema.prisma          # User, Watchlist, CryptoAlert, etc.
│   └── migrations/            # SQL migration history
├── docker-compose.yml         # Local PostgreSQL
│
├── src/
│   ├── app/                   # Next.js App Router (pages & API)
│   │   │
│   │   ├── (app)/             # Dashboard (NextAuth session required)
│   │   ├── auth/              # Login, signup pages
│   │   │   ├── layout.tsx     # Sidebar + top bar
│   │   │   ├── page.tsx       # Home / Terminal One
│   │   │   ├── alerts/
│   │   │   ├── watchlist/
│   │   │   ├── market/
│   │   │   ├── profile/
│   │   │   └── settings/      # Local browser preferences
│   │   │
│   │   ├── api/               # Backend HTTP handlers
│   │   │   ├── auth/                # NextAuth routes + signup
│   │   │   ├── avatars/             # Serve uploaded avatars from Postgres
│   │   │   ├── market/              # GET cached top-100 coins
│   │   │   ├── prices/              # Dashboard alias → same cache
│   │   │   ├── market/status/       # Health + optional logs (?logs=1)
│   │   │   └── alerts/              # Flash-crash rows from DB
│   │   │
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Theme tokens & utilities
│   │
│   ├── components/
│   │   ├── dashboard/         # Home terminal widgets
│   │   ├── layout/            # Sidebar, top bar
│   │   ├── charts/            # Sparklines
│   │   ├── alerts/            # Alert cards
│   │   ├── watchlist/         # Watchlist table
│   │   ├── ui/                # Buttons, cards, badges
│   │
│   ├── lib/
│   │   ├── auth/              # Session helpers, password hashing, profile
│   │   ├── db/
│   │   │   └── prisma.ts      # Prisma client singleton
│   │   ├── storage/avatars.ts # Avatar bytes in PostgreSQL
│   │   ├── logger.ts          # Structured JSON logs (poller, API, cache)
│   │   ├── market/            # In-process poller + memory cache (no separate server)
│   │   │   ├── poller.ts      # 30s CoinGecko poll loop
│   │   │   ├── memory-cache.ts
│   │   │   └── coingecko-fetcher.ts
│   │   ├── coingecko.ts       # Read from cache (API routes + pages)
│   │   ├── mock-data.ts       # Legacy mock (mostly replaced by live cache)
│   │   └── utils.ts           # cn(), formatUsd, etc.
│   │
│   ├── types/
│   │   └── auth.ts            # NextAuth session type extensions
│   │
│   └── middleware.ts          # Protects dashboard routes
│
├── .env                       # Secrets (not in git)
├── .env.example               # Template for required env vars
├── prisma.config.ts           # Prisma 7 config
└── FOLDER_STRUCTURE.md        # This file
```

## Auth flow (high level)

1. **Sign up** → `POST /api/auth/signup` → credentials sign-in
2. **Google** → Auth.js Google provider → `/api/auth/[...nextauth]`
3. **Login** → `signIn("credentials")` → JWT session via NextAuth
4. **Middleware** → redirects guests to `/auth/login`

## Commands

```bash
npm run db:up            # Start local PostgreSQL (Docker)
npm run dev              # Start app
npx prisma migrate dev   # Apply DB migrations
npx prisma generate      # Regenerate Prisma client
npm run build            # Production build
```
