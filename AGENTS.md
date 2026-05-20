# AGENTS.md — Monad Swap Rank

Instructions for Codex or any AI coding agent working on this repo.

## Project Summary

Monad Swap Rank is a wallet ranking app for the Monad ecosystem.

Users paste a Monad wallet address and receive an estimated swap-volume-based rank with basic wallet stats.

The ranking is based only on estimated swap volume.

The app must not claim to measure profit, loss, wealth, airdrop eligibility, or official Monad status.

## Development Philosophy

This project is being built step by step by a beginner with AI assistance.

Prioritize:

- Simple code
- Readable functions
- Small changes
- Clear file names
- Tests for important logic
- Safe error handling

Avoid:

- Overengineering
- Large rewrites
- Untested ranking logic
- Adding features without approval

Main rule:

```text
small step -> test -> confirm -> next step
```

## Required Checks

After important coding tasks, run:

```text
npm run test
npm run lint
npm run build
```

For UI changes, also run:

```text
npm run dev
```

Do not move forward if tests or build fail.

## Do Not Build Without Approval

Do not add:

- Leaderboard
- Wallet connect
- User accounts
- Payment features
- Airdrop checker
- Profit/loss tracker
- Multi-chain support
- Admin dashboard
- Complex anti-wash-trading system

## API Safety Rules

External API calls must happen server-side only.

Correct pattern:

```text
frontend -> internal Next.js API route -> external provider
```

Never hardcode secrets.
Never commit real API keys.
Use .env.example only for placeholder names.

## Ranking Rules

Use docs/scoring-rules.md as the source of truth.

Core formula:

```text
Total Swap Volume = sum of all valid swap USD values
```

Important rules:

- Count only successful swaps
- Do not count failed transactions
- Do not count normal transfers
- Do not count NFT mints or transfers
- Do not count bridge deposits or withdrawals in MVP
- Do not count liquidity deposits or withdrawals in MVP
- Do not double-count both sides of the same swap
- Do not count swaps without reliable USD value
- Avoid duplicate transaction hashes

## Rank Categories

Use these MVP categories:

```text
$0                         = No Swap Data
Greater than $0 and < $100 = Baby Nad
$100 and < $1,000          = Curious Nad
$1,000 and < $10,000       = Active Nad
$10,000 and < $100,000     = Heavy Nad
$100,000 and < $1,000,000  = Whale Nad
$1,000,000 and above       = Monad Monster
```

Do not change thresholds without approval.

## UI Rules

The UI should be:

- Mobile-first
- Simple
- Clean
- Fast
- Community-friendly
- Monad-inspired

Prioritize:

- Rank title
- Estimated swap volume
- Total swaps
- Share action
- Disclaimer

## Disclaimer Requirement

The app must show a disclaimer similar to:

```text
This rank is based only on estimated swap volume. It is not financial advice, not profit/loss data, not airdrop eligibility, and not an official Monad ranking.
```

## Data Provider Rules

The first provider to test should be Mobula.

Backup providers:

- Zerion
- Allium
- Monad explorer / RPC fallback

Do not build full real API integration until provider data has been tested.

## Stop And Review Points

Stop for review after:

- Initial app foundation works
- Mock UI works
- Ranking tests pass
- Provider API test is completed
- Real wallet ranking works
- Deployment works
