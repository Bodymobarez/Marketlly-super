import { readJson, writeJson } from "../storage";
import { normalizeVertical, type ShoppingVertical } from "../verticals";
import { demoCartSnapshot } from "../mocks/demoCart";
import { isDatabaseConfigured, replaceCartInDb } from "../db";

/** Bumped for GCC Madinah-first demo cart seed */
const KEY = "marketly_cart_v3_gcc";
const DEMO_FLAG = "marketly_cart_demo_v3";
const listeners = new Set<() => void>();

export type CartLine = {
  /** Aggregated product ref `providerId::externalId` or `marketly::listingId` */
  ref: string;
  providerId: string;
  providerName: string;
  externalId: string;
  listingId?: number;
  title: string;
  /** Unit price in BASE_CURRENCY (SAR) — convert on display */
  price: number;
  image: string;
  vertical: ShoppingVertical;
  quantity: number;
};

export type CartSnapshot = {
  lines: CartLine[];
  updatedAt: number;
};

function load(): CartSnapshot {
  const snap = readJson<CartSnapshot | null>(KEY, null);
  if (!snap || !Array.isArray(snap.lines)) {
    // First visit: seed a populated demo enquiry cart (user can clear)
    if (!readJson<boolean>(DEMO_FLAG, false)) {
      const demo = demoCartSnapshot() as CartSnapshot;
      writeJson(KEY, demo);
      writeJson(DEMO_FLAG, true);
      return demo;
    }
    return { lines: [], updatedAt: 0 };
  }
  if (!snap.lines.length) return snap;
  return {
    ...snap,
    lines: snap.lines.map((l) => ({
      ...l,
      vertical: normalizeVertical(l.vertical as string),
    })),
  };
}

function save(snap: CartSnapshot) {
  writeJson(KEY, snap);
  listeners.forEach((l) => l());
  if (isDatabaseConfigured()) void replaceCartInDb(snap.lines);
}

export function subscribeCart(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getCartSync(): CartSnapshot {
  return load();
}

export function cartCountSync(): number {
  return load().lines.reduce((n, l) => n + l.quantity, 0);
}

export function cartTotalSync(): number {
  return load().lines.reduce((n, l) => n + l.price * l.quantity, 0);
}

export function addToCart(input: Omit<CartLine, "quantity"> & { quantity?: number }): CartSnapshot {
  const snap = load();
  const qty = input.quantity ?? 1;
  const idx = snap.lines.findIndex((l) => l.ref === input.ref);
  if (idx >= 0) {
    snap.lines[idx] = {
      ...snap.lines[idx],
      quantity: snap.lines[idx].quantity + qty,
    };
  } else {
    snap.lines.push({ ...input, quantity: qty });
  }
  snap.updatedAt = Date.now();
  save(snap);
  return snap;
}

export function setCartQuantity(ref: string, quantity: number): CartSnapshot {
  const snap = load();
  if (quantity <= 0) {
    snap.lines = snap.lines.filter((l) => l.ref !== ref);
  } else {
    snap.lines = snap.lines.map((l) => (l.ref === ref ? { ...l, quantity } : l));
  }
  snap.updatedAt = Date.now();
  save(snap);
  return snap;
}

export function removeFromCart(ref: string): CartSnapshot {
  return setCartQuantity(ref, 0);
}

export function clearCart(): CartSnapshot {
  const snap = { lines: [], updatedAt: Date.now() };
  save(snap);
  return snap;
}

/** Group lines by provider — foreshadows one-cart → many sub-orders split */
export function groupCartBySeller(snap: CartSnapshot = load()): Record<string, CartLine[]> {
  const groups: Record<string, CartLine[]> = {};
  for (const line of snap.lines) {
    const key = line.providerId;
    if (!groups[key]) groups[key] = [];
    groups[key].push(line);
  }
  return groups;
}
