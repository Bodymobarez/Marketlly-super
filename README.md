# Marketly

UAE marketplace — web app, shared mock API, and separate iOS / Android Expo apps.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for routes and package layout.

## Web

```bash
npm i
npm run dev
```

Build: `npm run build`

## Mobile (Expo)

```bash
npm run mobile
```

Or:

```bash
npm --prefix apps/mobile start
```

iOS and Android UI live in separate folders under `apps/mobile/src/platforms/`.

## Shared API

`packages/core` provides listings, auth session, and CMS used by web + mobile.

## Database (Supabase)

```bash
cp .env.example .env
# fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
# run SQL in supabase/migrations/001_marketly_init.sql
```

Details: [DATABASE.md](./DATABASE.md)
