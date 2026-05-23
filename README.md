# Monad Swap Rank

Monad Swap Rank is a wallet ranking app for the Monad ecosystem.

Users can paste a Monad wallet address and receive an estimated swap-volume-based rank, basic wallet stats, and a shareable Nad-style result card.

Current status: early public version. Core wallet lookup and rank-card flow are working, while UI/UX, extra stats, and ranking logic improvements are still being refined.

## Live App

https://monad-swap-rank.vercel.app

Example wallet route:

```bash
/wallet/0x81EAD906C49B8cBFBB55f49A3a1F98d5B32997c8
```

## What It Does

This version includes:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component foundation
- Wallet address validation
- Server-side Mobula wallet trade lookup
- Monad mainnet swap-volume estimate
- Rank calculation based on detected swap volume
- Basic wallet result page
- Shareable/downloadable rank card
- 5-minute in-memory result cache
- Vitest logic test setup

## What The Rank Counts

The rank is based on Mobula-detected swaps on Monad mainnet.

It does not currently include:

- Total wallet transactions
- Token holdings
- NFT holdings
- Profit/loss data
- Airdrop eligibility
- Official Monad ranking data

## Environment Setup

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Required for live wallet lookups:

```bash
MOBULA_API_KEY=
```

Other environment variables in `.env.example` are placeholders for possible future integrations or research scripts.

Never commit real API keys. Keep external API calls server-side only, and do not expose provider keys in frontend code.

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
```

The package scripts are also available through npm-compatible names:

```bash
npm run dev
npm run build
npm run lint
npm run test
```

Provider research scripts:

```bash
pnpm test:mobula -- <wallet-address>
pnpm test:blockvision -- <wallet-address>
```

## Public Repo Safety Notes

This repo is designed to be safe for public viewing as long as real secrets stay out of GitHub.

Before making changes public, check that:

- `.env` and `.env.local` are not committed
- API keys are stored in Vercel Environment Variables or local environment files only
- Any new provider calls stay server-side
- No private keys, seed phrases, or personal wallet secrets are ever added

## Current Limitations

This is still an early build. The app does not yet include:

- Database-backed persistence
- Redis-backed production cache
- Wallet connect
- Leaderboard features
- Multi-provider verification
- Advanced anti-spam/rate limiting

## Disclaimer

This app is for community experimentation and education. The rank is based only on estimated swap volume. It is not financial advice, not profit/loss data, not airdrop eligibility, and not an official Monad ranking.
