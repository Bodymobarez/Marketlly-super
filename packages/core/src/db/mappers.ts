import type { AuthAccount, Listing, ListingStatus } from "../types";
import type { CartLine } from "../api/cart";
import type { GccCountry } from "../gcc";
import type { ShoppingVertical } from "../verticals";

export type ListingRow = {
  id: number;
  title: string;
  price: number;
  location: string;
  country: string | null;
  category: string;
  make: string | null;
  model: string | null;
  brand: string | null;
  img: string;
  verified: boolean;
  date_rank: number;
  description: string;
  status: string;
  owner_id: string | null;
  owner_name: string | null;
  vertical: string | null;
  tags: string[] | null;
};

export function listingToRow(l: Listing): ListingRow {
  return {
    id: l.id,
    title: l.title,
    price: l.price,
    location: l.location,
    country: l.country ?? null,
    category: String(l.category),
    make: l.make ?? null,
    model: l.model ?? null,
    brand: l.brand ?? null,
    img: l.img,
    verified: l.verified,
    date_rank: l.date,
    description: l.description,
    status: l.status,
    owner_id: l.ownerId ?? null,
    owner_name: l.ownerName ?? null,
    vertical: l.vertical ?? null,
    tags: l.tags ?? [],
  };
}

export function rowToListing(r: ListingRow): Listing {
  return {
    id: Number(r.id),
    title: r.title,
    price: Number(r.price),
    location: r.location,
    country: (r.country as GccCountry | null) ?? undefined,
    category: r.category,
    make: r.make ?? undefined,
    model: r.model ?? undefined,
    brand: r.brand ?? undefined,
    img: r.img,
    verified: !!r.verified,
    date: Number(r.date_rank),
    description: r.description ?? "",
    status: r.status as ListingStatus,
    ownerId: r.owner_id ?? undefined,
    ownerName: r.owner_name ?? undefined,
    vertical: (r.vertical as ShoppingVertical | null) ?? undefined,
    tags: r.tags ?? undefined,
  };
}

export type AccountRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  banned: boolean;
  verified: boolean;
  trade_license: string | null;
  vat_trn: string | null;
  permissions: AuthAccount["permissions"];
  created_at: string;
};

export function accountToRow(a: AuthAccount): AccountRow {
  return {
    id: a.id,
    name: a.name,
    email: a.email,
    password: a.password,
    role: a.role,
    banned: a.banned,
    verified: a.verified,
    trade_license: a.tradeLicense ?? null,
    vat_trn: a.vatTrn ?? null,
    permissions: a.permissions,
    created_at: a.createdAt,
  };
}

export function rowToAccount(r: AccountRow): AuthAccount {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    password: r.password,
    role: r.role as AuthAccount["role"],
    banned: !!r.banned,
    verified: !!r.verified,
    tradeLicense: r.trade_license ?? undefined,
    vatTrn: r.vat_trn ?? undefined,
    permissions: r.permissions,
    createdAt: r.created_at,
  };
}

export type CartLineRow = {
  session_id: string;
  ref: string;
  provider_id: string;
  provider_name: string;
  external_id: string;
  listing_id: number | null;
  title: string;
  price: number;
  image: string;
  vertical: string;
  quantity: number;
};

export function cartLineToRow(sessionId: string, l: CartLine): CartLineRow {
  return {
    session_id: sessionId,
    ref: l.ref,
    provider_id: l.providerId,
    provider_name: l.providerName,
    external_id: l.externalId,
    listing_id: l.listingId ?? null,
    title: l.title,
    price: l.price,
    image: l.image,
    vertical: l.vertical,
    quantity: l.quantity,
  };
}

export function rowToCartLine(r: CartLineRow): CartLine {
  return {
    ref: r.ref,
    providerId: r.provider_id,
    providerName: r.provider_name,
    externalId: r.external_id,
    listingId: r.listing_id ?? undefined,
    title: r.title,
    price: Number(r.price),
    image: r.image,
    vertical: r.vertical as CartLine["vertical"],
    quantity: Number(r.quantity),
  };
}
