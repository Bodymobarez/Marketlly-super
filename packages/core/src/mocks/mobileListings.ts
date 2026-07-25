import { SEED_LISTINGS } from "./seed";

export type MobilePreviewListing = {
  id: number;
  title: string;
  price: number;
  location: string;
  img: string;
  category: string;
  badge: string | null;
  tag: string | null;
  km: string | null;
  year: string | null;
  seller: string;
  rating: number;
  ago: string;
};

/** Shared Super Luxury slice for Android/iOS mobile previews — Madinah first */
export function mobilePreviewListings(limit = 12): MobilePreviewListing[] {
  const ago = ["2h ago", "5h ago", "1d ago", "3h ago", "12h ago", "4h ago", "6h ago", "8h ago", "1d ago", "2d ago", "3h ago", "9h ago"];
  return SEED_LISTINGS.slice(0, limit).map((l, i) => {
    const badge = i < 2 ? "Featured" : l.verified ? "Hot" : null;
    return {
      id: l.id,
      title: l.title,
      price: l.price,
      location: l.location,
      img: l.img,
      category: String(l.category).replace(/^./, (c) => c.toUpperCase()),
      badge,
      tag: badge,
      km: l.category === "cars" ? `${(2000 + i * 1800).toLocaleString()} km` : null,
      year: l.category === "cars" ? "2024" : null,
      seller: "Marketly Private Client",
      rating: l.verified ? 4.9 : 4.5,
      ago: ago[i % ago.length],
    };
  });
}
