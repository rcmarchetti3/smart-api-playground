
# Day 1 Backend Starter (Express + TypeScript + Postgres)

This is a minimal API you can run locally and deploy to Render. It has a `/ping` route that checks DB connectivity if `DATABASE_URL` is set.

## Local dev

```bash
cd apps/api
cp .env.example .env
# paste your Render Postgres External Connection string into .env
npm install
npm run dev
# open http://localhost:4000/ping
```

## Deploy to Render

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Root directory: `apps/api`
- Env vars:
  - `DATABASE_URL` = your Render Postgres External Connection string (keep `sslmode=require`)

## Optional: initialize table

In Render → your Postgres → **PSQL Shell**

```sql
create extension if not exists pgcrypto;
create table if not exists runs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  note text
);
```

## Next steps (Day 1 Frontend)

Create a Next.js app in a sibling folder `apps/web` and point it at this API:

```env
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

In your Next.js page:

```tsx
const api = process.env.NEXT_PUBLIC_API_URL;
const res = await fetch(api + "/ping", { cache: "no-store" });
```

Deploy frontend to Vercel with the same env var set to your Render API URL.
