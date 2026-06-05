# Crypto Sentry — Folder Structure

Quick map of the repo so you know where everything lives.

```
Crypto Sentry/
├── prisma/                    # Database schema & migrations
│   ├── schema.prisma          # CryptoAlert only (auth removed)
│   └── migrations/            # SQL migration history
│
├── src/
│   ├── app/                   # Next.js App Router (pages & API)
│   │   │
│   │   ├── (app)/             # Dashboard (Supabase session required)
│   │   ├── auth/              # Magic link login + callback
│   │   │   ├── layout.tsx     # Sidebar + top bar
│   │   │   ├── page.tsx       # Home / Terminal One
│   │   │   ├── alerts/
│   │   │   ├── watchlist/
│   │   │   ├── market/
│   │   │   ├── profile/
│   │   │   └── settings/      # Local browser preferences
│   │   │
│   │   ├── api/               # Backend HTTP handlers
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
│   │   ├── supabase/          # Supabase SSR clients + middleware session
│   │   ├── db/watchlist.ts    # Per-user watchlist (Supabase user id)
│   │   │   ├── index.ts       # handlers, auth, signIn, signOut
│   │   │   ├── config.ts      # Providers & callbacks
│   │   │   ├── totp.ts        # 2FA encrypt/verify
│   │   │   └── password.ts    # bcrypt helpers
│   │   ├── db/
│   │   │   └── prisma.ts      # Prisma client singleton
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
│   └── middleware.ts          # Protects dashboard; enforces 2FA gate
│
├── .env                       # Secrets (not in git)
├── .env.example               # Template for required env vars
├── prisma.config.ts           # Prisma 7 config
└── FOLDER_STRUCTURE.md        # This file
```

## Auth flow (high level)

1. **Sign up** → `POST /api/auth/register` → sign in at `/auth/login`
2. **Google** → Auth.js Google provider → `/api/auth/[...nextauth]`
3. **Login** → validate password → optional TOTP → JWT session
4. **2FA enabled** → middleware sends you to `/auth/2fa/verify` until code is confirmed
5. **Enable 2FA** → Settings → `/auth/2fa/setup` → scan QR → saved encrypted in DB

## Commands

```bash
npm run dev              # Start app
npx prisma migrate dev   # Apply DB migrations
npx prisma generate      # Regenerate Prisma client
npm run build            # Production build
```
