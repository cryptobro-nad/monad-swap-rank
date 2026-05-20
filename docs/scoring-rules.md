# Monad Swap Rank — Scoring Rules

This document defines how wallet rank is calculated.

## Core Rule

Monad Swap Rank ranks wallets based on estimated total USD swap volume.

It does not measure profit, loss, net worth, airdrop eligibility, or official Monad status.

## Main Formula

```text
Total Swap Volume = sum of all valid swap USD values
```

## What Counts As A Swap

A transaction can count as a swap if it represents an exchange between two assets, such as:

- MON to USDC
- USDC to MON
- Token A to Token B
- Token to MON
- MON to Token

For MVP, a swap should only count if the data provider identifies it as a swap/trade or gives enough structured data to classify it safely.

## What Does Not Count

Do not count:

- Normal wallet transfers
- NFT mints
- NFT transfers
- Airdrop claims
- Token claims
- Bridge deposits or withdrawals
- Liquidity deposits or withdrawals
- Contract approvals
- Failed transactions
- Spam token transfers
- Transactions with no reliable USD value

## One Swap Counts Once

A swap has two sides: token sent and token received.

Do not count both sides separately.

Example:

```text
100 MON -> 250 USDC
```

Correct:

```text
Swap volume = $250
```

Incorrect:

```text
$250 + $250 = $500
```

## USD Value Priority

Use the best available USD value:

1. Provider-supplied swap USD value
2. Historical token price if available
3. Current token price only if needed for MVP estimate
4. Skip if no reliable value exists

## Rank Categories

```text
$0                         = No Swap Data
Greater than $0 and < $100 = Baby Nad
$100 and < $1,000          = Curious Nad
$1,000 and < $10,000       = Active Nad
$10,000 and < $100,000     = Heavy Nad
$100,000 and < $1,000,000  = Whale Nad
$1,000,000 and above       = Monad Monster
```

## Required Functions

```ts
validateWalletAddress(address: string): boolean
calculateTotalSwapVolume(swaps: NormalizedSwap[]): number
getRankFromVolume(volumeUsd: number): RankResult
formatUsd(value: number): string
```

## Required Tests

Wallet validation tests:

- Valid EVM address passes
- Empty input fails
- Missing 0x fails
- Too short fails
- Too long fails
- Invalid characters fail

Swap volume tests:

- Valid swaps sum correctly
- Failed swaps are ignored
- Missing USD values are ignored
- Duplicate transaction hashes are ignored
- Zero swaps returns 0

Rank tests:

- $0 -> No Swap Data
- $50 -> Baby Nad
- $100 -> Curious Nad
- $1,000 -> Active Nad
- $10,000 -> Heavy Nad
- $100,000 -> Whale Nad
- $1,000,000 -> Monad Monster

## MVP Anti-Abuse Rules

For MVP:

- Count only successful swaps
- Count only swaps with reliable USD values
- Do not count normal transfers
- Do not count failed transactions
- Do not double-count duplicate transaction hashes
