# Monad Swap Rank

Monad Swap Rank is a wallet ranking app for the Monad ecosystem.

Users will paste a Monad wallet address and receive an estimated swap-volume-based rank with basic wallet stats.

Current status: initial Next.js app foundation.

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

## Current Scope

This first version includes:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component foundation
- Vitest logic test setup
- Project folders for `app`, `components`, `lib`, `tests`, and `docs`

It does not include real API integration, a database, Redis, wallet connect, or leaderboard features.
