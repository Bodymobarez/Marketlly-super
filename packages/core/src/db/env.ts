/** Read Vite / Node / injected env for Supabase */
export function getDbEnv(key: string): string | undefined {
  try {
    const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
    const v = meta.env?.[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  } catch {
    /* not Vite */
  }
  try {
    if (typeof process !== "undefined" && process.env?.[key]?.trim()) {
      return process.env[key]!.trim();
    }
  } catch {
    /* no process */
  }
  try {
    const w = globalThis as typeof globalThis & {
      __MARKETLY_ENV__?: Record<string, string | undefined>;
    };
    const v = w.__MARKETLY_ENV__?.[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  } catch {
    /* ignore */
  }
  return undefined;
}

export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = getDbEnv("VITE_SUPABASE_URL") ?? getDbEnv("SUPABASE_URL");
  const anonKey = getDbEnv("VITE_SUPABASE_ANON_KEY") ?? getDbEnv("SUPABASE_ANON_KEY");
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isDatabaseConfigured(): boolean {
  return getSupabaseConfig() != null;
}
