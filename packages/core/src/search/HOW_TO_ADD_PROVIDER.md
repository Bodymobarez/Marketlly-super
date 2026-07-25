# Adding a product search provider

Marketly Super Luxury discovers products via **provider adapters** — never scrapers.

## Contract

Implement `ProductSearchProvider` in `packages/core/src/search/types.ts`:

- `id` / `name` — stable source attribution shown as a badge in the UI
- `capabilities` — `integration: "partner_api" | "affiliate" | "mock" | "internal"`
- `search(query)` — return `SearchHit[]` with `vertical`, price in AED, image, etc.
- `getById(externalId)` — hydrate a single hit for product detail / cart

## Steps

1. Create `packages/core/src/search/providers/myPartner.ts` that returns a `ProductSearchProvider`.
2. Call `registerProvider(createMyPartnerProvider())` from `bootstrap.ts` (or from app startup).
3. Point `search` / `getById` at the **official** partner API or affiliate feed (API key via env).
4. Map partner payloads → `SearchHit` (include `externalUrl` when checkout stays on partner).
5. Optionally filter by `query.vertical` (`super` | `boats` | `yachts` | `villas` | `palaces` | `chalets` | `cars`).

## Rules

- Do **not** scrape third-party storefronts.
- Always set source metadata (`providerId` / name) so the aggregator can badge results.
- Prefer idempotent, rate-limited HTTP clients with timeouts.
- Keep secrets out of the client bundle; real partners should go through a backend BFF later.

## Demo providers

| id | name | role |
|----|------|------|
| `marketly` | Marketly | Internal Super Luxury catalog |
| `marinahub` | MarinaHub | Mock boats & yachts |
| `palmluxe` | PalmLuxe Estates | Mock villas, palaces, chalets |
| `royalgarage` | Royal Garage | Mock cars + lifestyle mix |
