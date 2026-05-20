# Monad Swap Rank — Codex Tasks

This file lists the safe build order for Codex.

Main rule:

```text
small task -> run checks -> confirm -> next task
```

Do not ask Codex to build the whole app at once.

## Checks After Major Tasks

Run:

```text
npm run dev
npm run test
npm run lint
npm run build
```

If a check fails, stop and fix it before moving forward.

## Task 1 — App Foundation

Create the initial Next.js TypeScript app foundation.

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui if possible
- Vitest for logic tests

Create folders:

- app
- components
- lib
- tests
- docs

Do not add real API integration yet.
Do not add database yet.
Do not add Redis yet.

## Task 2 — Wallet Validation

Add wallet address validation for EVM-style addresses.

Rules:

- Trim whitespace
- Must start with 0x
- Must be exactly 42 characters
- Must contain only hexadecimal characters after 0x

Add tests for valid and invalid inputs.

## Task 3 — Homepage Wallet Input

Build the homepage with:

- App name
- Short description
- Wallet input
- Submit button
- Invalid address error
- Route valid wallets to /wallet/[address]

Keep it simple and mobile-first.

## Task 4 — Mock Wallet Result Page

Create /wallet/[address] using mock data.

Show:

- Wallet address
- Rank title
- Estimated swap volume
- Total swaps
- Token count
- NFT count
- Last updated
- Disclaimer
- Copy/share result button

Do not add real API integration yet.

## Task 5 — Ranking Logic

Add:

- calculateTotalSwapVolume
- getRankFromVolume
- formatUsd

Use docs/scoring-rules.md as source of truth.

Add tests for volume calculation, rank boundaries, duplicate transaction hashes, and USD formatting.

## Task 6 — Mock Internal API Route

Create:

```text
GET /api/wallet/[address]
```

For now it should validate address and return mock wallet result JSON.

Update wallet result page to fetch from this internal route.

Do not call external APIs yet.

## Task 7 — Env Structure

Create .env.example for future provider, database, and cache variables.

Document that real keys must never be committed.

## Task 8 — Provider Test

Create a server-side provider test script later.

The first provider to test should be Mobula wallet trades.

Do not connect provider data to frontend until the response is confirmed.

## Stop Points

Stop and review after:

- App foundation works
- Mock UI works
- Ranking tests pass
- Provider data test is completed
- Real wallet ranking works
- Deployment works
