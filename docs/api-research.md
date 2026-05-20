# Monad Swap Rank — API Research

This document defines the API strategy for Monad Swap Rank.

## Main Data Question

Can we reliably fetch Monad wallet swap history with USD values?

If yes, the app is straightforward to build. If no, we may need raw transaction parsing, which should not be the first MVP path.

## Data Needed For MVP

- Wallet address
- Swap history
- USD value per swap
- Total number of swaps
- Token holdings
- NFT holdings or NFT count
- Last updated time
- Data source

Useful optional fields:

- Transaction hash
- Timestamp
- Token symbols
- Token contract addresses
- DEX/source name
- Pagination support

## Provider Candidates

### 1. Mobula

Mobula is the first provider to test because it appears relevant for wallet trades and wallet activity.

Need to confirm:

- Monad mainnet support
- Monad testnet support
- Wallet trades endpoint works for Monad
- Trades include USD values
- Trades include transaction hashes
- Trades include timestamps
- Pagination exists
- API key and rate limits are acceptable

Use Mobula first only if it returns clean wallet swap/trade data with USD values.

### 2. Zerion

Zerion may be useful for:

- Portfolio data
- Token holdings
- NFT holdings
- Decoded transactions
- Backup swap/activity data

Use Zerion if Mobula data is incomplete or if holdings/NFT data is better there.

### 3. Allium

Allium may be useful later for deeper analytics and custom queries.

Do not start with Allium unless simpler APIs fail.

### 4. Explorer / RPC

Monad explorer or RPC can be used as fallback/debug data.

Do not start with raw RPC for MVP because it requires custom swap detection, log parsing, pricing, and duplicate handling.

## Recommended Strategy

1. Test Mobula wallet trades.
2. If Mobula works, use it for swap volume.
3. Test Zerion for holdings/NFTs if needed.
4. Use Allium later for deeper analytics.
5. Use explorer/RPC only as fallback.

## API Safety

API keys must never be exposed in frontend code.

Correct pattern:

```text
Frontend -> internal Next.js API route -> external provider
```

Expected internal endpoint later:

```text
GET /api/wallet/[address]
```

## Backend Route Responsibilities

The internal route should:

- Validate wallet address
- Check cache later
- Call provider API if needed
- Normalize provider response
- Calculate total swap volume
- Assign rank
- Return clean JSON to frontend

## Provider Normalization

Provider-specific responses must be converted into internal app types.

Correct flow:

```text
Provider response -> normalize -> internal swaps -> ranking logic
```

## First API Test Task

Before full integration, create a server-side test script that checks whether Mobula wallet trades returns usable data.

The script should show:

- Number of trades returned
- Whether USD values exist
- Sample transaction hash
- Sample timestamp
- Sample token fields
- Whether pagination exists

Do not connect this to the frontend until the data is confirmed.
