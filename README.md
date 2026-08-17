# IRONMAX — Social Casino

Next.js 16 (App Router) + Prisma/Postgres + NextAuth. 100 coins = €1. Coins are never
withdrawable — deposit-only virtual balance, plus a separate free demo balance (50 coins
on signup) so players can try any game before paying.

## Stack
- **App/hosting**: Vercel
- **Database**: Postgres on AWS RDS, via Prisma
- **Auth**: NextAuth (credentials, bcrypt)
- **Payments**: PayNet Easy (deposit-only — real EUR in, coins out, no withdrawal path)
- **Games**: one shared provably-fair engine (`src/lib/fair.ts`) driving 16 game configs
  (`src/lib/games/registry.ts`) — slots ×2, dice, limbo, coinflip, wheel, roulette, mines,
  tower, plinko, keno, hi-lo, blackjack, baccarat, video poker, crash.
- **Invoices**: PDF generated server-side (`@react-pdf/renderer`), stored as bytes in Postgres,
  downloadable from the account page.

## Local setup
```bash
cp .env.example .env   # fill in DATABASE_URL etc.
npm install
npx prisma migrate dev
npm run dev
```

## Deploy

### 1. Database — AWS RDS Postgres
1. Create an RDS Postgres instance (public access only if you're not using a VPC peering /
   PrivateLink setup with Vercel — otherwise keep it private and use Vercel's AWS integration).
2. Create a database + user, then set `DATABASE_URL` in Vercel's project env vars:
   `postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require`
3. Run `npx prisma migrate deploy` (from CI or locally pointed at the RDS instance) to apply
   the schema — do this before or during first deploy, not automatically on every build.

### 2. App — Vercel
1. `vercel link`, then set env vars from `.env.example` in the Vercel dashboard
   (`DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `PAYNET_*`).
2. `vercel --prod`.

### 3. Payments — PayNet Easy
`src/lib/paynet.ts` wraps their merchant API (end-point-id + HMAC-signed requests) — verify
the exact field names and webhook payload shape against your PayNet Easy merchant dashboard
before going live, and point their deposit-confirmed webhook at
`https://<your-domain>/api/webhooks/paynet`.

## Admin access
There's no signup flow for admins — promote a user manually:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
```
Admins get `/admin`: see all users + wallets, all deposits, and can adjust any user's real
coin balance.

## Known simplifications (ponytail-tagged in code)
- Provably-fair seed is generated and revealed in the same request instead of pre-committed
  (hash shown before bet, seed after) — fine for MVP, tighten before marketing "provably fair".
- Invoice PDFs are stored as bytes in Postgres instead of S3 — move to S3 if invoice volume/size
  grows.
