# Marketly architecture

## Packages

| Path | Role |
|------|------|
| `.` (`@marketly/web`) | Vite web marketplace + Admin live-edit |
| `packages/core` (`@marketly/core`) | Shared API: listings, auth, CMS, cart, Super Luxury Search + DB layer |
| `apps/mobile` (`@marketly/mobile`) | Expo app with **separate** iOS and Android UI |

## Database

Supabase Postgres when `VITE_SUPABASE_*` is set — see [DATABASE.md](./DATABASE.md).  
Schema: `supabase/migrations/001_marketly_init.sql`. LocalStorage remains the demo fallback.

## Super Luxury System

Primary brand mode **Super Luxury** (`super`) plus lifestyle **verticals** (persisted in `marketly-vertical`):

| Id | Role |
|----|------|
| `super` | Super Luxury hub — all lifestyle categories |
| `boats` | مراكب / private boats |
| `yachts` | يخوت / marina yachts |
| `villas` | فلل / waterfront & golf estates |
| `palaces` | قصور / ultra-prime residences |
| `chalets` | شاليهات / beach & desert retreats |
| `cars` | عربيات / hypercars & chauffeur motors |

### Multi-source product search

```
UI (/search) → superSearch() → Provider registry → Aggregator (merge / dedupe / rank)
                                 ├─ marketly (internal catalog)
                                 ├─ marinahub (mock boats/yachts)
                                 ├─ palmluxe (mock villas/palaces/chalets)
                                 └─ royalgarage (mock cars + lifestyle)
```

- Contract: `ProductSearchProvider` in `packages/core/src/search/types.ts`
- Register via `registerProvider()` / `bootstrapSearchProviders()`
- How to plug a real partner API: `packages/core/src/search/HOW_TO_ADD_PROVIDER.md`
- Results always carry **source attribution** (`providerName` badge)
- Cart groups lines by provider (one-cart → many sub-orders foreshadow)

## Web routes

| Path | Page |
|------|------|
| `/` | Landing (+ vertical switcher) |
| `/auth` | Auth |
| `/browse` | Browse (vertical-aware listings) |
| `/search` | Super Luxury Search (multi-source) |
| `/product/:ref` | Aggregated product detail (`providerId::externalId`) |
| `/cart` | Cart |
| `/listing/:id` | Internal listing detail |
| `/post` | Post ad (auth) |
| `/auctions`, `/auctions/:id` | Auctions |
| `/admin/*` | Admin (admin role) |
| `/preview/ios`, `/preview/android` | Thin device previews using shared API |

Page entrypoints live in `src/pages/*`. Shared UI stays in `src/app/components/*`.

## Mobile

```
apps/mobile/src/platforms/ios/       # HIG — do not import android/
apps/mobile/src/platforms/android/   # Material — do not import ios/
apps/mobile/src/shared/              # hooks → @marketly/core
```

## CMS parallel edit

Admin Elements / live-edit on web persists locally and mirrors into `cmsApi` (`marketly_cms_v1`). Mobile and web previews read the same CMS values.
