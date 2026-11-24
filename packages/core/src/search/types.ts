import type { ShoppingVertical } from "../verticals";
import type { GccCountry, GccCurrency } from "../gcc";

/** Capabilities advertised by a product search provider */
export type ProviderCapabilities = {
  search: boolean;
  getById: boolean;
  facets?: boolean;
  /** Official partner API / affiliate — never scrapers */
  integration: "internal" | "mock" | "affiliate" | "partner_api";
  verticals: ShoppingVertical[];
};

export type ProductSearchQuery = {
  q: string;
  vertical?: ShoppingVertical;
  location?: string;
  /** Market country filter (AE/SA/KW/BH/QA/OM/EG) */
  country?: GccCountry;
  limit?: number;
  /** Restrict to specific provider ids; omit = all registered */
  providers?: string[];
};

export type SearchHit = {
  /** Stable id within the provider */
  externalId: string;
  title: string;
  /** Amount in BASE_CURRENCY (SAR) */
  price: number;
  /** Storage currency for the hit — catalog uses SAR */
  currency: GccCurrency;
  location: string;
  country?: GccCountry;
  image: string;
  description: string;
  brand?: string;
  category: string;
  vertical: ShoppingVertical;
  inStock: boolean;
  rating?: number;
  /** Extra signals for ranking */
  popularity?: number;
  /** Deep link when product lives on partner site (affiliate/partner API) */
  externalUrl?: string;
  /** Internal Marketly listing id when sourced from our catalog */
  listingId?: number;
};

export type ProviderSearchResult = {
  providerId: string;
  providerName: string;
  hits: SearchHit[];
  tookMs: number;
  error?: string;
};

/**
 * Adapter contract for multi-source product discovery.
 * Implement this to plug an official partner API or affiliate feed.
 * See packages/core/src/search/HOW_TO_ADD_PROVIDER.md
 */
export interface ProductSearchProvider {
  readonly id: string;
  readonly name: string;
  readonly capabilities: ProviderCapabilities;
  search(query: ProductSearchQuery): Promise<ProviderSearchResult>;
  getById(externalId: string): Promise<SearchHit | null>;
}

/** Unified result after aggregation — always carries source attribution */
export type AggregatedProduct = SearchHit & {
  /** `${providerId}::${externalId}` */
  ref: string;
  providerId: string;
  providerName: string;
  /** 0–1 blended relevance after merge/rank */
  score: number;
  /** Duplicate refs collapsed into this hit */
  duplicateCount: number;
};

export type AggregatedSearchResult = {
  query: ProductSearchQuery;
  products: AggregatedProduct[];
  byProvider: ProviderSearchResult[];
  tookMs: number;
};
