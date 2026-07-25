import type { Listing } from "../types";
import { getSupabase, setDbLastError } from "./client";
import { listingToRow, rowToListing, type ListingRow } from "./mappers";

export async function fetchListingsFromDb(): Promise<Listing[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("listings").select("*").order("id", { ascending: true });
  if (error) {
    setDbLastError(error.message);
    return null;
  }
  setDbLastError(null);
  return (data as ListingRow[]).map(rowToListing);
}

export async function upsertListingsToDb(listings: Listing[]): Promise<boolean> {
  const sb = getSupabase();
  if (!sb || listings.length === 0) return false;
  const rows = listings.map(listingToRow);
  const { error } = await sb.from("listings").upsert(rows, { onConflict: "id" });
  if (error) {
    setDbLastError(error.message);
    return false;
  }
  setDbLastError(null);
  return true;
}

export async function upsertListingToDb(listing: Listing): Promise<boolean> {
  return upsertListingsToDb([listing]);
}

export async function deleteListingFromDb(id: number): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("listings").delete().eq("id", id);
  if (error) {
    setDbLastError(error.message);
    return false;
  }
  return true;
}
