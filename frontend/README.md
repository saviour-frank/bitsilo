# BitSilo Frontend

React frontend for BitSilo — a non-custodial sBTC micro-yield vault on Stacks.

## Tech Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** + **Radix UI**
- **@stacks/connect** — wallet connection (Leather / Xverse)
- **@stacks/transactions** — on-chain reads & writes
- **Framer Motion** — animations
- **Recharts** — share price chart

## Getting Started

```sh
npm install
npm run dev
```

The dev server runs at `http://localhost:8080`.

## Build

```sh
npm run build
npm run preview
```

## Deployment

Deployed on Vercel. Push to `main` triggers automatic deployment.

## Network

Currently configured for **Stacks Testnet**. Contract addresses are hardcoded in `src/lib/stacks.ts`.
