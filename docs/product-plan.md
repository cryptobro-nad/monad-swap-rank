# Monad Swap Rank — Product Plan

Monad Swap Rank is a simple wallet ranking app for the Monad ecosystem.

Users paste a Monad wallet address and receive a result based on estimated swap volume.

## MVP Goal

The MVP should answer one question:

> How much swap volume has this wallet done on Monad?

The app should not claim to measure profit, wealth, airdrop eligibility, or official Monad status.

## MVP Features

- Homepage with wallet input
- EVM wallet address validation
- Wallet result page
- Estimated swap volume
- Total swaps
- Rank category
- Token holdings if available
- NFT holdings if available
- Copy/share result text
- Clear disclaimer

## Main User Flow

1. User opens website.
2. User pastes wallet address.
3. App validates the address.
4. App checks cache/database later.
5. App fetches wallet data from provider later.
6. App calculates estimated swap volume.
7. App assigns rank.
8. App shows result.

## Pages

- `/` — homepage and wallet input
- `/wallet/[address]` — wallet result page
- `/api/wallet/[address]` — internal API route later

## Design Direction

- Mobile-first
- Simple
- Clean
- Monad-inspired
- Easy to understand
- Shareable on X

## Do Not Build In MVP

- Leaderboard
- Wallet connect
- User accounts
- Airdrop checker
- Profit/loss tracker
- Multi-chain support
- Advanced anti-wash-trading
- Complex NFT valuation

## Development Rule

Build step by step:

```text
small step -> test -> confirm -> next step
```
