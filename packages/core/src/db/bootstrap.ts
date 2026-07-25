import { seededListings } from "../mocks/seed";
import { readJson, writeJson } from "../storage";
import { isDatabaseConfigured } from "./env";
import { getSupabase, setDbLastError, type DbStatus } from "./client";
import { fetchListingsFromDb, upsertListingsToDb } from "./listingsRepo";
import { fetchAccountsFromDb, upsertAccountsToDb } from "./accountsRepo";
import { fetchCartFromDb } from "./cartRepo";

const LISTINGS_KEY = "marketly_listings_v5_gcc";
const ACCOUNTS_KEY = "marketly_accounts_v1";
const CART_KEY = "marketly_cart_v3_gcc";
const BOOT_FLAG = "marketly_db_bootstrapped_v1";

export type BootstrapResult = {
  status: DbStatus;
  source: "supabase" | "local";
  listings: number;
  accounts: number;
  message?: string;
};

/**
 * Connect to Supabase when configured:
 * - Pull listings/accounts into local cache
 * - If remote catalog empty → seed from Madinah-first inventory and upsert
 * Falls back to localStorage mock when env is missing or unreachable.
 */
export async function bootstrapDatabase(): Promise<BootstrapResult> {
  if (!isDatabaseConfigured()) {
    return {
      status: "disabled",
      source: "local",
      listings: readJson<unknown[]>(LISTINGS_KEY, []).length || seededListings().length,
      accounts: readJson<unknown[]>(ACCOUNTS_KEY, []).length,
      message: "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — using local mock DB",
    };
  }

  const sb = getSupabase();
  if (!sb) {
    return {
      status: "error",
      source: "local",
      listings: 0,
      accounts: 0,
      message: "Failed to create Supabase client",
    };
  }

  try {
    // Health ping
    const ping = await sb.from("listings").select("id", { count: "exact", head: true });
    if (ping.error) {
      setDbLastError(ping.error.message);
      return {
        status: "error",
        source: "local",
        listings: 0,
        accounts: 0,
        message: `DB error: ${ping.error.message}. Apply supabase/migrations/001_marketly_init.sql`,
      };
    }

    let listings = await fetchListingsFromDb();
    if (!listings || listings.length === 0) {
      const seed = seededListings();
      await upsertListingsToDb(seed);
      listings = seed;
      writeJson(LISTINGS_KEY, seed);
    } else {
      writeJson(LISTINGS_KEY, listings);
    }

    let accounts = await fetchAccountsFromDb();
    if (!accounts || accounts.length === 0) {
      const localAccounts = readJson<Parameters<typeof upsertAccountsToDb>[0]>(ACCOUNTS_KEY, []);
      if (localAccounts.length) {
        await upsertAccountsToDb(localAccounts);
        accounts = localAccounts;
      } else {
        accounts = [];
      }
    } else {
      writeJson(ACCOUNTS_KEY, accounts);
    }

    const cart = await fetchCartFromDb();
    if (cart && cart.lines.length) {
      writeJson(CART_KEY, cart);
    }

    writeJson(BOOT_FLAG, { at: Date.now(), listings: listings.length });

    return {
      status: "ready",
      source: "supabase",
      listings: listings.length,
      accounts: accounts.length,
      message: `Connected — ${listings.length} listings from Supabase`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    setDbLastError(msg);
    return {
      status: "error",
      source: "local",
      listings: 0,
      accounts: 0,
      message: msg,
    };
  }
}
