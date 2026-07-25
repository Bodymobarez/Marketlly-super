import type { AuthAccount } from "../types";
import { getSupabase, setDbLastError } from "./client";
import { accountToRow, rowToAccount, type AccountRow } from "./mappers";

export async function fetchAccountsFromDb(): Promise<AuthAccount[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("accounts").select("*");
  if (error) {
    setDbLastError(error.message);
    return null;
  }
  return (data as AccountRow[]).map(rowToAccount);
}

export async function upsertAccountsToDb(accounts: AuthAccount[]): Promise<boolean> {
  const sb = getSupabase();
  if (!sb || accounts.length === 0) return false;
  const { error } = await sb.from("accounts").upsert(accounts.map(accountToRow), { onConflict: "id" });
  if (error) {
    setDbLastError(error.message);
    return false;
  }
  return true;
}
