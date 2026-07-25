import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./env";

let client: SupabaseClient | null = null;
let configured = false;

export function getSupabase(): SupabaseClient | null {
  if (configured) return client;
  configured = true;
  const cfg = getSupabaseConfig();
  if (!cfg) {
    client = null;
    return null;
  }
  client = createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export type DbStatus = "disabled" | "ready" | "error";

let lastError: string | null = null;

export function getDbLastError(): string | null {
  return lastError;
}

export function setDbLastError(msg: string | null) {
  lastError = msg;
}
