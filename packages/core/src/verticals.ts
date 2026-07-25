/** Super Luxury shopping verticals for Marketly */
export type LuxuryCategory =
  | "boats"
  | "yachts"
  | "villas"
  | "palaces"
  | "chalets"
  | "cars";

/** `super` = Super Luxury hub (all categories). Others filter by lifestyle vertical. */
export type ShoppingVertical = "super" | LuxuryCategory;

export type VerticalMeta = {
  id: ShoppingVertical;
  labelEn: string;
  labelAr: string;
  taglineEn: string;
  taglineAr: string;
  /** Categories typically shown in this mode */
  categories: string[];
  accent: string;
};

export const LUXURY_CATEGORIES: LuxuryCategory[] = [
  "boats",
  "yachts",
  "villas",
  "palaces",
  "chalets",
  "cars",
];

export const VERTICALS: Record<ShoppingVertical, VerticalMeta> = {
  super: {
    id: "super",
    labelEn: "Super Luxury",
    labelAr: "سوبر لكشري",
    taglineEn: "Yachts · villas · cars · Super Luxury across the GCC — starting from Madinah",
    taglineAr: "يخوت · فلل · سيارات · سوبر لكشري في دول الخليج — نبدأ من المدينة المنورة",
    categories: [...LUXURY_CATEGORIES],
    accent: "#b45309",
  },
  boats: {
    id: "boats",
    labelEn: "Boats",
    labelAr: "مراكب",
    taglineEn: "Private boats & day-cruisers across the Gulf",
    taglineAr: "مراكب خاصة وطرادات نهارية في الخليج",
    categories: ["boats"],
    accent: "#0e7490",
  },
  yachts: {
    id: "yachts",
    labelEn: "Yachts",
    labelAr: "يخوت",
    taglineEn: "Superyachts & marina berths across GCC coasts",
    taglineAr: "يخوت فاخرة ومراسي على سواحل الخليج",
    categories: ["yachts"],
    accent: "#1d4ed8",
  },
  villas: {
    id: "villas",
    labelEn: "Villas",
    labelAr: "فلل",
    taglineEn: "Madinah, Palm, Riyadh & waterfront estates across the GCC",
    taglineAr: "فلل المدينة ونخلة جميرا والرياض والواجهات البحرية في الخليج",
    categories: ["villas"],
    accent: "#a16207",
  },
  palaces: {
    id: "palaces",
    labelEn: "Palaces",
    labelAr: "قصور",
    taglineEn: "Palatial residences for the ultra-select",
    taglineAr: "قصور سكنية للنخبة",
    categories: ["palaces"],
    accent: "#7c3aed",
  },
  chalets: {
    id: "chalets",
    labelEn: "Chalets",
    labelAr: "شاليهات",
    taglineEn: "Beach, desert & mountain retreats across the GCC",
    taglineAr: "ملاذات شاطئية وصحراوية وجبلية في دول الخليج",
    categories: ["chalets"],
    accent: "#047857",
  },
  cars: {
    id: "cars",
    labelEn: "Cars",
    labelAr: "عربيات",
    taglineEn: "Hypercars, G-Class & chauffeur-grade motors",
    taglineAr: "سيارات فائقة وفئة جي ومركبات فاخرة",
    categories: ["cars", "motors"],
    accent: "#b91c1c",
  },
};

export const VERTICAL_ORDER: ShoppingVertical[] = [
  "super",
  "boats",
  "yachts",
  "villas",
  "palaces",
  "chalets",
  "cars",
];

export function isShoppingVertical(value: string | null | undefined): value is ShoppingVertical {
  return !!value && value in VERTICALS;
}

/** Legacy grocery/elite modes map to Super Luxury hub */
export function normalizeVertical(value: string | null | undefined): ShoppingVertical {
  if (value === "grocery" || value === "elite") return "super";
  if (isShoppingVertical(value)) return value;
  return "super";
}

export function matchesVertical(
  itemVertical: ShoppingVertical | undefined,
  active: ShoppingVertical,
  itemCategory?: string,
): boolean {
  if (active === "super") return true;
  if (itemVertical === active) return true;
  const cat = (itemCategory || "").toLowerCase();
  if (cat && VERTICALS[active].categories.some((c) => c.toLowerCase() === cat)) {
    return true;
  }
  // Legacy motors listings surface under Cars
  if (active === "cars" && (cat === "motors" || itemVertical === undefined)) {
    return cat === "motors" || cat === "cars";
  }
  return false;
}
