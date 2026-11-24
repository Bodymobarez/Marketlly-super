# Marketly — Database

The app uses **Supabase (Postgres)** when configured, with **localStorage** as offline/demo fallback.

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → paste and run [`supabase/migrations/001_marketly_init.sql`](./supabase/migrations/001_marketly_init.sql).
3. Copy `.env.example` → `.env` and set:

```bash
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

4. Restart `npm run dev`.

On boot, `bootstrapDatabase()`:

- Loads listings / accounts / cart from Supabase into the local cache
- If the remote catalog is empty, seeds the Madinah-first Super Luxury inventory and upserts it

## What syncs

| Entity   | Table         | Behavior                                      |
|----------|---------------|-----------------------------------------------|
| Listings | `listings`    | Read on boot; create/update/delete → upsert   |
| Accounts | `accounts`    | Read on boot; signup/admin changes → upsert   |
| Cart     | `cart_lines`  | Read on boot; every cart mutation replaces    |

Prices are stored in **SAR** (base currency). The UI converts via `gcc/money` when the user changes country (incl. **EGP** for Egypt).

Markets: SA · AE · KW · BH · QA · OM · **EG** — apply `002_add_egypt.sql` if the DB was created before Egypt support.

## Without `.env`

The app runs fully on the mock/local layer — no crash. Status: `disabled`.
