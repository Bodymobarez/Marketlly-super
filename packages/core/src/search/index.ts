export type {
  AggregatedProduct,
  AggregatedSearchResult,
  ProductSearchProvider,
  ProductSearchQuery,
  ProviderCapabilities,
  ProviderSearchResult,
  SearchHit,
} from "./types";
export {
  registerProvider,
  unregisterProvider,
  getProvider,
  listProviders,
  clearProviders,
  createRegistry,
} from "./registry";
export { aggregateSearch, getAggregatedByRef, productRef } from "./aggregator";
export { bootstrapSearchProviders, ensureSearchProviders } from "./bootstrap";
export { createInternalCatalogProvider } from "./providers/internalCatalog";
export {
  createMarinaHubProvider,
  createPalmLuxeProvider,
  createRoyalGarageProvider,
  createGulfMartProvider,
  createLuxuryLaneProvider,
  createCityBazaarProvider,
} from "./providers/mockCatalog";

import { ensureSearchProviders } from "./bootstrap";
import { aggregateSearch, getAggregatedByRef } from "./aggregator";
import { listProviders } from "./registry";
import type { AggregatedSearchResult, ProductSearchQuery } from "./types";

/** Convenience: ensure defaults registered, then aggregate. */
export async function superSearch(query: ProductSearchQuery): Promise<AggregatedSearchResult> {
  ensureSearchProviders();
  return aggregateSearch(query);
}

export async function superGetByRef(ref: string) {
  ensureSearchProviders();
  return getAggregatedByRef(ref);
}

export function listSearchSources() {
  ensureSearchProviders();
  return listProviders().map((p) => ({
    id: p.id,
    name: p.name,
    capabilities: p.capabilities,
  }));
}
