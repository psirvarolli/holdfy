# Holdfy

**Pix-protected escrow for online marketplaces, backed by a public smart contract on Stellar.**

Holdfy lets a seller create a protected order and a buyer pay it with Pix. The
payment is converted to a stablecoin and held in an auditable escrow contract
on the Stellar network until the buyer confirms receipt — only then is the
value released to the seller. Neither party, and not even Holdfy alone, can
move the funds outside those rules: releasing early or resolving a dispute
always requires a second signature beyond the platform's own key.

Live at **[www.holdfyai.com.br](https://www.holdfyai.com.br)**. Currently
running on Stellar **testnet** — see [Status](#status) below.

---

## How it works

1. A seller creates an order (item, price, buyer's phone) from the web app or
   from the [WhatsApp bot](#whatsapp-bot-holdfy-whatsapp).
2. The buyer pays via Pix. The Pix payment is converted to USDC and deposited
   into a single-release escrow contract deployed on Stellar.
3. Digital goods release as soon as payment is confirmed (no shipping step).
   Physical goods wait for the seller to mark the order as shipped.
4. The buyer confirms receipt, which releases the escrowed USDC to the
   seller's wallet.
5. Either side can open a dispute at any point before release. Resolution is
   an administrative decision by the Holdfy team, informed by both parties'
   evidence and responses — the smart contract itself only executes whatever
   split is decided, requiring the platform's signature **and** a second,
   independent signature to move anything.

## Integrations

| Service | What it's used for |
|---|---|
| **[Pollar](https://pollar.xyz)** | Wallet-as-a-service. Issues and custodies each user's Stellar wallet, handles login (email/Google/embedded wallet), identity verification (KYC), and the Pix ↔ USDC on/off-ramp. Holdfy also uses Pollar's `client.stellar.sep10` primitive to build its own first-party login: the server issues a [SEP-10](https://stellar.org/protocol/sep-10) challenge, the user's wallet signs it, and `@stellar/stellar-sdk`'s `WebAuth` verifies the signature server-side — proving wallet ownership without Holdfy ever touching a private key. |
| **[Trustless Work](https://trustlesswork.com)** | Deploys and manages the Soroban escrow contracts: single-release deploy, funding, milestone status changes, dispute flagging, and dispute-resolution transactions. All fund-moving actions are verified against the real on-chain state before Holdfy's database is updated — the database never trusts a client claim that a payment or release happened. |
| **[InfinitePay](https://www.infinitepay.io)** | Payment processor for the seller subscription (**Pro** plan). Generates a checkout link for the monthly fee; the webhook is never trusted at face value — every notification is independently re-verified against InfinitePay's own API before granting access. |
| **[Twilio](https://www.twilio.com/docs/whatsapp)** | WhatsApp Business API channel used by the companion [holdfy-whatsapp](#whatsapp-bot-holdfy-whatsapp) bot, so sellers can create orders and buyers can check order status without opening the web app. |
| **[Neon](https://neon.tech)** | Managed Postgres (production database), accessed through Prisma. |
| **[Vercel](https://vercel.com)** | Hosting, serverless functions, Cron Jobs (daily encrypted database backup — see [Security](#security)), and Blob storage (dispute evidence photos/videos, backup snapshots). |
| **[Sentry](https://sentry.io)** | Error monitoring across server, edge, and client runtimes. |

## Features

- **Escrow checkout flow** for both digital and physical goods, with a
  per-product-type timeline (payment → shipping → delivery → release).
- **Dispute flow**: either party can open a dispute, respond with their side
  and upload evidence (photos/videos); the admin panel resolves it with a
  2-of-2 signed transaction.
- **Seller plans** (Starter / Pro / Enterprise) with different per-transaction
  fees, monthly included escrow quotas, and per-order value limits.
- **Admin panel** (`/admin`) for dispute resolution and viewing the landing
  page's early-access waitlist, behind its own password-based session
  (independent of Pollar).
- **Public landing page** in Portuguese, Spanish, and English, with an
  early-access waitlist.
- **WhatsApp bot** (companion repo) — see below.

### WhatsApp bot (`holdfy-whatsapp`)

A separate repository, [holdfy-whatsapp](https://github.com/psirvarolli/holdfy-whatsapp),
implements a conversational bot on top of this app's API. It supports either
Twilio's WhatsApp API or Meta's Cloud API behind a shared interface, so a
seller can create an order and a buyer can look up their orders — with no
native buttons on Twilio, numbered text menus are resolved back to the same
option space — entirely from WhatsApp. Confirming receipt still requires the
buyer's wallet signature, so that step deep-links back to the web app rather
than happening natively in the chat.

The bot authenticates its order-creation calls to this app with a shared
server-to-server secret (`HOLDFY_BOT_API_SECRET`) rather than a user session,
since it has no browser and no wallet-signing surface of its own. A seller
links their WhatsApp number to their wallet once, from **Settings**, before
the bot can create orders on their behalf.

## Security

- **Wallet authentication (SEP-10)** — every state-changing call from the
  browser (creating an order, listing your own orders, linking a WhatsApp
  number) requires a session established by signing a server-issued
  challenge with the caller's own wallet; nothing trusts a client-supplied
  wallet address anymore.
- **Rate limiting** — an atomic Postgres upsert (`RateLimitBucket`), not an
  in-memory counter, so it holds up correctly across Vercel's serverless
  instances. Applied to admin login, the wallet-auth endpoints, and the
  public lead-capture form.
- **Encrypted daily backups** — a Vercel Cron job snapshots the core tables
  to Blob storage every day, AES-256-GCM encrypted (Blob storage has no
  private/authenticated read mode, so the ciphertext is the only thing that
  protects it) — independent of whatever retention Neon itself provides.
  See `scripts/decrypt-backup.mjs` to restore from a snapshot.
- **Error monitoring** — Sentry captures server, edge, and client exceptions
  in production.
- Network selection (`STELLAR_NETWORK=testnet|mainnet`) is a single source of
  truth that every Stellar-touching module derives from — including a guard
  that refuses to start if `TRUSTLESS_WORK_BASE_URL` doesn't match the
  selected network, so a partial/inconsistent switch to mainnet fails loudly
  instead of silently signing against the wrong network.

## Status

This app runs on Stellar **testnet**. Going to mainnet with real funds still
needs, outside of this codebase: confirmation from Pollar on regulatory
classification and fund segregation, and a production (non-Sandbox) WhatsApp
Business number for the bot. None of that blocks using or developing the app
as-is.

## Tech stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS · Prisma +
PostgreSQL · `@stellar/stellar-sdk` · Vitest

## Project structure

```
app/                    Routes (App Router) — public landing page, the
                         authenticated app (/dashboard, /orders, /settings,
                         /plans), /admin, and all /api/** route handlers
components/              UI, split into shared/, landing/, admin/, seller/,
                         buyer/, and ui/ (design-system primitives)
lib/server/              Server-only logic: orders, plans, disputes, Pollar
                         session verification, Trustless Work client,
                         InfinitePay client, rate limiting
lib/                     Client-side contexts/hooks (orders, role, theme,
                         locale) and browser-side API clients
prisma/                  schema.prisma, migrations, seed script
scripts/                 One-off operational scripts (e.g. decrypt-backup.mjs)
```

## Getting started

### Prerequisites

- Node.js, npm
- Docker (for a local Postgres instance)

### Environment variables

Set these in `.env`:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `STELLAR_NETWORK` / `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` or `mainnet` |
| `USDC_ISSUER` | USDC issuer account for the selected network |
| `TRUSTLESS_WORK_BASE_URL` / `TRUSTLESS_WORK_API_KEY` | Trustless Work API |
| `POLLAR_SECRET_KEY` / `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY` | Pollar SDK |
| `INFINITEPAY_HANDLE` | InfinitePay checkout handle (`@`-less InfiniteTag) |
| `HOLDFY_PLATFORM_SECRET_KEY` / `HOLDFY_PLATFORM_PUBLIC_KEY` | Platform Stellar keypair — signs SEP-10 challenges and platform-side escrow actions |
| `HOLDFY_DISPUTE_RESOLVER_SECRET_KEY` / `HOLDFY_DISPUTE_RESOLVER_PUBLIC_KEY` | 2-of-2 dispute-resolution signing account |
| `ADMIN_SESSION_SECRET` / `ADMIN_PASSWORD` | Admin panel login |
| `HOLDFY_BOT_API_SECRET` | Shared secret for the WhatsApp bot's server-to-server calls |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (evidence uploads, backups) |
| `CRON_SECRET` / `BACKUP_ENCRYPTION_KEY` | Daily backup job auth + encryption key |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Error monitoring |

### Database

```bash
docker compose up -d       # start local Postgres (once — stays running)
npx prisma migrate deploy  # apply migrations
npx prisma db seed         # seed demo data + billing plans
```

### Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm test
```

Vitest, no external dependency required — Trustless Work and Prisma are
mocked for unit tests, while the rate-limiter and the SEP-10 auth flow are
tested against a real local Postgres and real generated Stellar keypairs
respectively (still no network calls to Stellar or Trustless Work). Coverage
includes the full order lifecycle (create → pay → confirm → ship → receive,
for both digital and physical goods) end to end, not just each step in
isolation.

## Deployment

Hosted on Vercel, database on Neon. `vercel.json` schedules a daily Cron Job
against `/api/internal/backup`. Deploys are triggered from `main` via
`git push` + `vercel deploy --prod`; `postinstall` runs `prisma generate` on
every install so the client always matches the current schema — pending
Prisma migrations still need `prisma migrate deploy` run explicitly against
production before deploying code that depends on them.
