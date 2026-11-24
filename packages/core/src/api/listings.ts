import { fail, ok, withLatency, type ApiResult } from "./client";
import { seededListings } from "../mocks/seed";
import { readJson, writeJson } from "../storage";
import type { CreateListingInput, Listing, ListingFilters, ListingStatus } from "../types";
import { LUXURY_CATEGORIES, matchesVertical } from "../verticals";
import { deleteListingFromDb, isDatabaseConfigured, upsertListingToDb } from "../db";

/** Bumped when Egypt market + geo seed expands */
const KEY = "marketly_listings_v6_egypt";
const listeners = new Set<() => void>();

/** Re-seed when local cache is empty, thin, or missing Super Luxury / Egypt */
function needsReseed(stored: Listing[]): boolean {
  if (!stored.length) return true;
  const seedLen = seededListings().length;
  if (stored.length < Math.max(20, Math.floor(seedLen * 0.55))) return true;
  const cats = new Set(stored.map((l) => String(l.category).toLowerCase()));
  for (const c of LUXURY_CATEGORIES) {
    if (c === "cars") {
      if (!cats.has("cars") && !cats.has("motors")) return true;
      continue;
    }
    if (!cats.has(c)) return true;
  }
  // Madinah launch default must have marine + estate inventory
  const madinah = stored.filter((l) => l.location.toLowerCase().includes("madinah"));
  const madinahCats = new Set(madinah.map((l) => String(l.category).toLowerCase()));
  for (const c of ["yachts", "boats", "villas", "cars"] as const) {
    if (!madinahCats.has(c)) return true;
  }
  // Egypt market must be present
  if (!stored.some((l) => l.country === "EG")) return true;
  return false;
}

function load(): Listing[] {
  const stored = readJson<Listing[] | null>(KEY, null);
  if (!stored || !Array.isArray(stored) || needsReseed(stored)) {
    const seed = seededListings();
    writeJson(KEY, seed);
    return seed;
  }
  return stored;
}

function persistOne(listing: Listing) {
  if (isDatabaseConfigured()) void upsertListingToDb(listing);
}

export function subscribeListings(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export async function listListings(filters: ListingFilters = {}): Promise<ApiResult<Listing[]>> {
  return withLatency(() => {
    let list = load();
    const status = filters.status ?? "approved";
    if (status !== "all") {
      list = list.filter((l) => {
        if (l.status === status) return true;
        if (
          filters.includeOwnPending &&
          filters.userId &&
          l.status === "pending" &&
          l.ownerId === filters.userId
        ) {
          return true;
        }
        return false;
      });
    }
    if (filters.category) {
      const c = filters.category.toLowerCase();
      list = list.filter((l) => String(l.category).toLowerCase() === c);
    }
    if (filters.vertical) {
      const v = filters.vertical;
      list = list.filter((l) => matchesVertical(l.vertical, v, String(l.category)));
    }
    if (filters.country) {
      const c = filters.country;
      list = list.filter((l) => l.country === c);
    }
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      list = list.filter((l) => l.location.toLowerCase().includes(loc));
    }
    if (filters.make) {
      const m = filters.make.toLowerCase();
      list = list.filter((l) => (l.make || "").toLowerCase() === m);
    }
    if (filters.model) {
      const m = filters.model.toLowerCase();
      list = list.filter((l) => (l.model || "").toLowerCase().includes(m));
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          (l.make || "").toLowerCase().includes(q) ||
          (l.model || "").toLowerCase().includes(q),
      );
    }
    return ok(list);
  });
}

export async function getListing(id: number): Promise<ApiResult<Listing>> {
  return withLatency(() => {
    const found = load().find((l) => l.id === id);
    return found ? ok(found) : fail("Listing not found");
  });
}

export async function createListing(input: CreateListingInput): Promise<ApiResult<Listing>> {
  return withLatency(() => {
    const list = load();
    const nextId = Math.max(0, ...list.map((l) => l.id)) + 1;
    const status: ListingStatus =
      input.role === "dealer" || input.role === "admin" ? "approved" : "pending";
    const listing: Listing = {
      id: nextId,
      title: input.title,
      price: input.price,
      location: input.location,
      country: input.country,
      category: input.category,
      make: input.make,
      model: input.model,
      img: input.img,
      verified: input.role === "dealer" || input.role === "admin",
      date: 0,
      description: input.description,
      status,
      ownerId: input.ownerId,
      ownerName: input.ownerName,
    };
    const next = [listing, ...list];
    writeJson(KEY, next);
    listeners.forEach((l) => l());
    persistOne(listing);
    return ok(listing);
  });
}

export async function updateListingStatus(
  id: number,
  status: ListingStatus,
): Promise<ApiResult<Listing>> {
  return withLatency(() => {
    const list = load();
    const idx = list.findIndex((l) => l.id === id);
    if (idx < 0) return fail("Listing not found");
    list[idx] = { ...list[idx], status };
    writeJson(KEY, list);
    listeners.forEach((l) => l());
    persistOne(list[idx]);
    return ok(list[idx]);
  });
}

export async function removeListing(id: number): Promise<ApiResult<true>> {
  return withLatency(() => {
    const list = load();
    if (!list.some((l) => l.id === id)) return fail("Listing not found");
    writeJson(KEY, list.filter((l) => l.id !== id));
    listeners.forEach((l) => l());
    if (isDatabaseConfigured()) void deleteListingFromDb(id);
    return ok(true);
  });
}

/** Sync helper for UI that needs all admin listings */
export function getAllListingsSync(): Listing[] {
  return load();
}
