import type { ShoppingVertical } from "../../verticals";
import type { GccCountry } from "../../gcc";
import { BASE_CURRENCY } from "../../gcc";
import type {
  ProductSearchProvider,
  ProductSearchQuery,
  ProviderSearchResult,
  SearchHit,
  ProviderCapabilities,
} from "../types";

type MockItem = Omit<SearchHit, "currency"> & { currency?: typeof BASE_CURRENCY; country?: GccCountry };

function filterHits(items: MockItem[], query: ProductSearchQuery): SearchHit[] {
  const q = (query.q || "").toLowerCase().trim();
  let list = items.map((i) => ({ ...i, currency: BASE_CURRENCY }));
  if (query.vertical && query.vertical !== "super") {
    list = list.filter(
      (i) =>
        i.vertical === query.vertical ||
        i.category.toLowerCase() === query.vertical,
    );
  }
  if (query.country) {
    list = list.filter((i) => i.country === query.country);
  }
  if (query.location) {
    const loc = query.location.toLowerCase();
    list = list.filter((i) => i.location.toLowerCase().includes(loc));
  }
  if (q) {
    list = list.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.brand || "").toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q),
    );
  }
  return list.slice(0, query.limit ?? 24);
}

function createMockProvider(opts: {
  id: string;
  name: string;
  verticals: ShoppingVertical[];
  items: MockItem[];
  latencyMs?: number;
}): ProductSearchProvider {
  const caps: ProviderCapabilities = {
    search: true,
    getById: true,
    integration: "mock",
    verticals: opts.verticals,
  };
  const byId = new Map(opts.items.map((i) => [i.externalId, i]));

  return {
    id: opts.id,
    name: opts.name,
    capabilities: caps,
    async search(query: ProductSearchQuery): Promise<ProviderSearchResult> {
      const started = Date.now();
      await delay(opts.latencyMs ?? 35);
      if (
        query.vertical &&
        query.vertical !== "super" &&
        !opts.verticals.includes(query.vertical) &&
        !opts.verticals.includes("super")
      ) {
        return {
          providerId: opts.id,
          providerName: opts.name,
          hits: [],
          tookMs: Date.now() - started,
        };
      }
      return {
        providerId: opts.id,
        providerName: opts.name,
        hits: filterHits(opts.items, query),
        tookMs: Date.now() - started,
      };
    },
    async getById(externalId: string) {
      await delay(20);
      const hit = byId.get(externalId);
      return hit ? { ...hit, currency: BASE_CURRENCY } : null;
    },
  };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Demo marina partner — boats & yachts across GCC coasts */
export function createMarinaHubProvider(): ProductSearchProvider {
  return createMockProvider({
    id: "marinahub",
    name: "MarinaHub",
    verticals: ["boats", "yachts", "super"],
    latencyMs: 45,
    items: [
      {
        externalId: "mh-yacht-madinah",
        title: "Azimut S7 — Madinah Private Client",
        price: 9800000,
        location: "Madinah",
        country: "SA",
        image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=400&q=80",
        description: "Sportfly yacht · Red Sea delivery · Madinah private-client desk.",
        brand: "Azimut",
        category: "yachts",
        vertical: "yachts",
        inStock: true,
        rating: 4.9,
        popularity: 97,
      },
      {
        externalId: "mh-boat-madinah",
        title: "Pardo 43 Walkaround — Madinah",
        price: 2650000,
        location: "Madinah",
        country: "SA",
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80",
        description: "Day cruiser · teak cockpit · Madinah private-client delivery.",
        brand: "Pardo",
        category: "boats",
        vertical: "boats",
        inStock: true,
        rating: 4.75,
        popularity: 89,
      },
      {
        externalId: "mh-yacht-jeddah",
        title: "Sunseeker 86 Yacht — Jeddah",
        price: 19800000,
        location: "Jeddah",
        country: "SA",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80",
        description: "Red Sea flybridge · turnkey berth · crew trained.",
        brand: "Sunseeker",
        category: "yachts",
        vertical: "yachts",
        inStock: true,
        rating: 4.88,
        popularity: 94,
      },
      {
        externalId: "mh-yacht-1",
        title: "Riva 88 Domino Super — Dubai Marina",
        price: 16500000,
        location: "Dubai Marina",
        country: "AE",
        image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&q=80",
        description: "Italian superyacht · mahogany salon · turnkey berth.",
        brand: "Riva",
        category: "yachts",
        vertical: "yachts",
        inStock: true,
        rating: 4.9,
        popularity: 96,
      },
      {
        externalId: "mh-yacht-doha",
        title: "Pershing 8X — The Pearl",
        price: 14200000,
        location: "The Pearl",
        country: "QA",
        image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=400&q=80",
        description: "Carbon-tech hull · 40+ knot cruise · Pearl berth.",
        brand: "Pershing",
        category: "yachts",
        vertical: "yachts",
        inStock: true,
        rating: 4.85,
        popularity: 90,
      },
      {
        externalId: "mh-boat-manama",
        title: "Wallytender 48 — Manama Harbour",
        price: 4100000,
        location: "Manama",
        country: "BH",
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80",
        description: "Open day-boat · teak beach club · Gulf-ready.",
        brand: "Wally",
        category: "boats",
        vertical: "boats",
        inStock: true,
        rating: 4.7,
        popularity: 82,
      },
      {
        externalId: "mh-boat-kw",
        title: "Pardo 50 Walkaround — Kuwait City",
        price: 3750000,
        location: "Kuwait City",
        country: "KW",
        image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=400&q=80",
        description: "Mediterranean style · overnight suite · low hours.",
        brand: "Pardo",
        category: "boats",
        vertical: "boats",
        inStock: true,
        rating: 4.6,
        popularity: 78,
      },
      {
        externalId: "mh-yacht-muscat",
        title: "Sanlorenzo SL96A — Muscat Marina",
        price: 31000000,
        location: "Muscat",
        country: "OM",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80",
        description: "Asymmetric design · owner suite on main deck.",
        brand: "Sanlorenzo",
        category: "yachts",
        vertical: "yachts",
        inStock: false,
        rating: 4.95,
        popularity: 88,
      },
    ],
  });
}

/** Demo estate partner — Madinah-first + GCC estates */
export function createPalmLuxeProvider(): ProductSearchProvider {
  return createMockProvider({
    id: "palmluxe",
    name: "PalmLuxe Estates",
    verticals: ["villas", "palaces", "chalets", "super"],
    latencyMs: 55,
    items: [
      {
        externalId: "pl-villa-madinah",
        title: "Ohud Hills Signature Villa — Madinah",
        price: 19200000,
        location: "Madinah",
        country: "SA",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80",
        description: "Mountain-view estate · smart home · near Ohud.",
        brand: "Private",
        category: "villas",
        vertical: "villas",
        inStock: true,
        rating: 4.92,
        popularity: 99,
      },
      {
        externalId: "pl-palace-madinah",
        title: "Royal Guest Palace — Madinah",
        price: 98000000,
        location: "Madinah",
        country: "SA",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80",
        description: "Ceremonial majlis · guest wing · ultra-prime Madinah.",
        brand: "Private Collection",
        category: "palaces",
        vertical: "palaces",
        inStock: true,
        rating: 5,
        popularity: 98,
      },
      {
        externalId: "pl-chalet-madinah",
        title: "Desert Retreat Chalet — Madinah",
        price: 6400000,
        location: "Madinah",
        country: "SA",
        image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&q=80",
        description: "Stargazing decks · pool · weekend escape.",
        brand: "Private",
        category: "chalets",
        vertical: "chalets",
        inStock: true,
        rating: 4.75,
        popularity: 91,
      },
      {
        externalId: "pl-villa-1",
        title: "Frond G Signature Villa — Palm Jumeirah",
        price: 92000000,
        location: "Palm Jumeirah",
        country: "AE",
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80",
        description: "Private beach · elevator · smart automation throughout.",
        brand: "Nakheel",
        category: "villas",
        vertical: "villas",
        inStock: true,
        rating: 4.95,
        popularity: 98,
      },
      {
        externalId: "pl-villa-doha",
        title: "Pearl Qatar Frond Villa",
        price: 51000000,
        location: "The Pearl",
        country: "QA",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80",
        description: "Private beach · elevator · Pearl address.",
        brand: "United Development",
        category: "villas",
        vertical: "villas",
        inStock: true,
        rating: 4.85,
        popularity: 90,
      },
      {
        externalId: "pl-palace-riyadh",
        title: "Diplomatic Quarter Palace — Riyadh",
        price: 225000000,
        location: "Riyadh",
        country: "SA",
        image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&q=80",
        description: "Ceremonial courtyard · guest palace · secure compound.",
        brand: "Private Collection",
        category: "palaces",
        vertical: "palaces",
        inStock: true,
        rating: 4.9,
        popularity: 94,
      },
    ],
  });
}

/** Demo motors aggregator — Madinah-first + GCC capitals */
export function createRoyalGarageProvider(): ProductSearchProvider {
  return createMockProvider({
    id: "royalgarage",
    name: "Royal Garage",
    verticals: ["cars", "yachts", "villas", "super"],
    latencyMs: 40,
    items: [
      {
        externalId: "rg-car-madinah-1",
        title: "Rolls-Royce Cullinan — Madinah",
        price: 2350000,
        location: "Madinah",
        country: "SA",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&q=80",
        description: "Black Badge · Madinah private client delivery.",
        brand: "Rolls-Royce",
        category: "cars",
        vertical: "cars",
        inStock: true,
        rating: 5,
        popularity: 100,
      },
      {
        externalId: "rg-car-madinah-2",
        title: "Mercedes-Benz G63 AMG — Madinah",
        price: 1100000,
        location: "Madinah",
        country: "SA",
        image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&q=80",
        description: "Night package · first owner · Madinah registered.",
        brand: "Mercedes-Benz",
        category: "cars",
        vertical: "cars",
        inStock: true,
        rating: 4.9,
        popularity: 97,
      },
      {
        externalId: "rg-car-1",
        title: "Bugatti Chiron Super Sport",
        price: 18500000,
        location: "Dubai",
        country: "AE",
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80",
        description: "Hypercar allocation · private client delivery.",
        brand: "Bugatti",
        category: "cars",
        vertical: "cars",
        inStock: true,
        rating: 5,
        popularity: 99,
      },
      {
        externalId: "rg-car-riyadh",
        title: "Lamborghini Urus Performante — Riyadh",
        price: 1400000,
        location: "Riyadh",
        country: "SA",
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80",
        description: "Performante aero · Riyadh registered.",
        brand: "Lamborghini",
        category: "cars",
        vertical: "cars",
        inStock: true,
        rating: 4.85,
        popularity: 91,
      },
      {
        externalId: "rg-car-kw",
        title: "Mercedes-Maybach S680 — Kuwait City",
        price: 1450000,
        location: "Kuwait City",
        country: "KW",
        image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&q=80",
        description: "Chauffeur partition · executive rear lounge.",
        brand: "Mercedes-Maybach",
        category: "cars",
        vertical: "cars",
        inStock: true,
        rating: 4.9,
        popularity: 93,
      },
      {
        externalId: "rg-villa-madinah",
        title: "Al Uyoun Luxury Villa — Madinah",
        price: 24500000,
        location: "Madinah",
        country: "SA",
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80",
        description: "Private pool · majlis wing · secure compound.",
        brand: "Private Estate",
        category: "villas",
        vertical: "villas",
        inStock: true,
        rating: 4.9,
        popularity: 96,
      },
    ],
  });
}

/** @deprecated Use createMarinaHubProvider — kept as alias for any external imports */
export const createGulfMartProvider = createMarinaHubProvider;
/** @deprecated Use createPalmLuxeProvider */
export const createLuxuryLaneProvider = createPalmLuxeProvider;
/** @deprecated Use createRoyalGarageProvider */
export const createCityBazaarProvider = createRoyalGarageProvider;
