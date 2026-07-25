import type { CartLine, CartSnapshot } from "../api/cart";
import { getSupabase, setDbLastError } from "./client";
import { cartLineToRow, rowToCartLine, type CartLineRow } from "./mappers";

const SESSION_KEY = "marketly_db_session_id";

export function getCartSessionId(): string {
  if (typeof localStorage === "undefined") return "server";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function fetchCartFromDb(sessionId = getCartSessionId()): Promise<CartSnapshot | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("cart_lines").select("*").eq("session_id", sessionId);
  if (error) {
    setDbLastError(error.message);
    return null;
  }
  const lines = (data as CartLineRow[]).map(rowToCartLine);
  return { lines, updatedAt: Date.now() };
}

export async function replaceCartInDb(
  lines: CartLine[],
  sessionId = getCartSessionId(),
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error: delErr } = await sb.from("cart_lines").delete().eq("session_id", sessionId);
  if (delErr) {
    setDbLastError(delErr.message);
    return false;
  }
  if (!lines.length) return true;
  const { error } = await sb.from("cart_lines").insert(lines.map((l) => cartLineToRow(sessionId, l)));
  if (error) {
    setDbLastError(error.message);
    return false;
  }
  return true;
}
