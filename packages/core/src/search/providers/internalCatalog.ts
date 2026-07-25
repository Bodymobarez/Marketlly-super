import { listListings, getListing } from "../../api/listings";
import type { Listing } from "../../types";
import { BASE_CURRENCY } from "../../gcc";
import {
  LUXURY_CATEGORIES,
  type LuxuryCategory,
  type ShoppingVertical,
} from "../../verticals";
import type {
  ProductSearchProvider,
  ProductSearchQuery,
  ProviderSearchResult,
  SearchHit,
} from "../types";

function listingVertical(l: Listing): ShoppingVertical {
  if (l.vertical) return l.vertical;
  const cat = String(l.category).toLowerCase();
  if ((LUXURY_CATEGORIES as string[]).includes(cat)) return cat as LuxuryCategory;
  if (cat === "motors") return "cars";
  // Legacy grocery/elite → hub
  if (cat === "grocery" || cat === "food" || cat === "luxury" || cat === "watches") {
    return "super";
  }
  return "super";
}

function toHit(l: Listing): SearchHit {
  return {
    externalId: String(l.id),
    title: l.title,
    price: l.price,
    currency: BASE_CURRENCY,
    location: l.location,
    country: l.country,
    image: l.img,
    description: l.description,
    brand: l.make || l.brand,
    category: String(l.category),
    vertical: listingVertical(l),
    inStock: l.status === "approved",
    rating: l.verified ? 4.8 : 4.2,
    popularity: Math.max(10, 100 - (l.date || 0) * 5),
    listingId: l.id,
  };
}

export function createInternalCatalogProvider(): ProductSearchProvider {
  return {
    id: "marketly",
    name: "Marketly",
    capabilities: {
      search: true,
      getById: true,
      facets: true,
      integration: "internal",
      verticals: ["super", ...LUXURY_CATEGORIES],
    },
    async search(query: ProductSearchQuery): Promise<ProviderSearchResult> {
      const started = Date.now();
      const res = await listListings({
        q: query.q || undefined,
        location: query.location,
        country: query.country,
        vertical: query.vertical,
        status: "approved",
      });
      const hits = res.ok ? res.data.map(toHit) : [];
      const limited = hits.slice(0, query.limit ?? 24);
      return {
        providerId: "marketly",
        providerName: "Marketly",
        hits: limited,
        tookMs: Date.now() - started,
        error: res.ok ? undefined : res.error,
      };
    },
    async getById(externalId: string) {
      const id = Number(externalId);
      if (!Number.isFinite(id)) return null;
      const res = await getListing(id);
      return res.ok ? toHit(res.data) : null;
    },
  };
}
