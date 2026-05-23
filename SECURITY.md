# Security Policy

Monad Swap Rank is an early community project. Please do not submit or share private wallet information, seed phrases, private keys, or real API keys in issues, pull requests, screenshots, or discussions.

## Secrets

Real secrets must stay outside the repository.

Use local environment files for development and Vercel Environment Variables for production.

Do not commit:

- `.env`
- `.env.local`
- API keys
- service role keys
- private keys
- seed phrases or mnemonics
- wallet recovery information

## Wallet Safety

The app only asks for a public EVM wallet address.

Never enter or share:

- seed phrases
- private keys
- passwords
- wallet recovery files
- signing requests that you do not understand

## Public Repo Checks

Before publishing or sharing major changes, run:

```bash
pnpm safety:public
```

This checks tracked files for obvious secret leaks. It is not a full professional audit, but it helps catch common mistakes before public release.

## Reporting Issues

If you notice a security issue, avoid posting real secrets publicly. Open an issue with a safe description of the problem, or contact the maintainer privately if sensitive details are involved.

## Disclaimer

This project is not an official Monad ranking, not financial advice, and not a security-audited financial product.
