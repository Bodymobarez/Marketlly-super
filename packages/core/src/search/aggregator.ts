import { listProviders, getProvider } from "./registry";
import type {
  AggregatedProduct,
  AggregatedSearchResult,
  ProductSearchProvider,
  ProductSearchQuery,
  SearchHit,
} from "./types";
import type { ShoppingVertical } from "../verticals";

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenOverlap(a: string, b: string): number {
  const ta = new Set(normalizeTitle(a).split(" ").filter((t) => t.length > 1));
  const tb = new Set(normalizeTitle(b).split(" ").filter((t) => t.length > 1));
  if (ta.size === 0 || tb.size === 0) return 0;
  let hit = 0;
  ta.forEach((t) => {
    if (tb.has(t)) hit += 1;
  });
  return hit / Math.max(ta.size, tb.size);
}

function textScore(hit: SearchHit, q: string): number {
  if (!q.trim()) return 0.5;
  const nq = normalizeTitle(q);
  const title = normalizeTitle(hit.title);
  if (title === nq) return 1;
  if (title.includes(nq)) return 0.9;
  const overlap = tokenOverlap(hit.title, q);
  const brand = hit.brand ? normalizeTitle(hit.brand) : "";
  const brandBonus = brand && nq.includes(brand) ? 0.1 : 0;
  return Math.min(1, overlap * 0.85 + brandBonus);
}

function verticalBoost(hit: SearchHit, vertical?: ShoppingVertical): number {
  if (!vertical || vertical === "super") return 0;
  return hit.vertical === vertical ? 0.12 : -0.2;
}

function rankScore(hit: SearchHit, q: string, vertical?: ShoppingVertical): number {
  const text = textScore(hit, q);
  const pop = Math.min(1, (hit.popularity ?? 50) / 100) * 0.15;
  const rating = ((hit.rating ?? 3.5) / 5) * 0.1;
  const stock = hit.inStock ? 0.05 : -0.3;
  return text + pop + rating + stock + verticalBoost(hit, vertical);
}

function productRef(providerId: string, externalId: string): string {
  return `${providerId}::${externalId}`;
}

/**
 * Fan-out search across registered providers, merge, dedupe near-duplicates,
 * and rank with source attribution preserved on every hit.
 */
export async function aggregateSearch(
  query: ProductSearchQuery,
  providerList?: ProductSearchProvider[],
): Promise<AggregatedSearchResult> {
  const started = Date.now();
  const all = providerList ?? listProviders();
  const selected = query.providers?.length
    ? all.filter((p) => query.providers!.includes(p.id))
    : all;

  const byProvider = await Promise.all(
    selected.map(async (p) => {
      try {
        return await p.search(query);
      } catch (e) {
        return {
          providerId: p.id,
          providerName: p.name,
          hits: [],
          tookMs: 0,
          error: e instanceof Error ? e.message : "Provider failed",
        };
      }
    }),
  );

  type Acc = AggregatedProduct;
  const merged: Acc[] = [];
  const seenKeys = new Map<string, number>();

  for (const batch of byProvider) {
    for (const hit of batch.hits) {
      const score = rankScore(hit, query.q, query.vertical);
      const dedupeKey = `${normalizeTitle(hit.title)}|${Math.round(hit.price / 50)}`;
      const existingIdx = seenKeys.get(dedupeKey);

      if (existingIdx !== undefined) {
        const existing = merged[existingIdx];
        existing.duplicateCount += 1;
        if (score > existing.score) {
          merged[existingIdx] = {
            ...hit,
            ref: productRef(batch.providerId, hit.externalId),
            providerId: batch.providerId,
            providerName: batch.providerName,
            score,
            duplicateCount: existing.duplicateCount,
          };
        }
        continue;
      }

      seenKeys.set(dedupeKey, merged.length);
      merged.push({
        ...hit,
        ref: productRef(batch.providerId, hit.externalId),
        providerId: batch.providerId,
        providerName: batch.providerName,
        score,
        duplicateCount: 1,
      });
    }
  }

  merged.sort((a, b) => b.score - a.score);
  const limit = query.limit ?? 48;

  return {
    query,
    products: merged.slice(0, limit),
    byProvider,
    tookMs: Date.now() - started,
  };
}

/** Resolve a composite ref (`providerId::externalId`) via the registry. */
export async function getAggregatedByRef(ref: string): Promise<AggregatedProduct | null> {
  const sep = ref.indexOf("::");
  if (sep < 0) return null;
  const providerId = ref.slice(0, sep);
  const externalId = ref.slice(sep + 2);
  const provider = getProvider(providerId);
  if (!provider) return null;
  const hit = await provider.getById(externalId);
  if (!hit) return null;
  return {
    ...hit,
    ref,
    providerId: provider.id,
    providerName: provider.name,
    score: 1,
    duplicateCount: 1,
  };
}

export { productRef };
