/** First-party geo/reference — GCC + Egypt (luxury MENA markets). */

export type GccCountry = "AE" | "SA" | "KW" | "BH" | "QA" | "OM" | "EG";

export type GccCurrency = "AED" | "SAR" | "KWD" | "BHD" | "QAR" | "OMR" | "EGP";

export type GccCity = {
  /** Stable English slug used in filters / storage */
  id: string;
  country: GccCountry;
  labelEn: string;
  labelAr: string;
  /** Prioritize in “near you” / default launch */
  priority?: number;
};

export type GccCountryMeta = {
  code: GccCountry;
  labelEn: string;
  labelAr: string;
  currency: GccCurrency;
  currencyLabelEn: string;
  currencyLabelAr: string;
  /** E.164 dialing prefix, e.g. "+966" */
  dialCode: string;
  /** BCP-47 locale hint */
  locale: string;
  /** Flag emoji for lightweight UI chips */
  flag: string;
};

/** Launch defaults — Medina / Madinah, Saudi Arabia */
export const DEFAULT_GCC_COUNTRY: GccCountry = "SA";
export const DEFAULT_GCC_CITY_ID = "madinah";
export const DEFAULT_GCC_CITY_LABEL = "Madinah";

export const GCC_COUNTRIES: GccCountryMeta[] = [
  {
    code: "SA",
    labelEn: "Saudi Arabia",
    labelAr: "السعودية",
    currency: "SAR",
    currencyLabelEn: "Saudi Riyal",
    currencyLabelAr: "ريال سعودي",
    dialCode: "+966",
    locale: "ar-SA",
    flag: "🇸🇦",
  },
  {
    code: "AE",
    labelEn: "UAE",
    labelAr: "الإمارات",
    currency: "AED",
    currencyLabelEn: "UAE Dirham",
    currencyLabelAr: "درهم إماراتي",
    dialCode: "+971",
    locale: "ar-AE",
    flag: "🇦🇪",
  },
  {
    code: "KW",
    labelEn: "Kuwait",
    labelAr: "الكويت",
    currency: "KWD",
    currencyLabelEn: "Kuwaiti Dinar",
    currencyLabelAr: "دينار كويتي",
    dialCode: "+965",
    locale: "ar-KW",
    flag: "🇰🇼",
  },
  {
    code: "BH",
    labelEn: "Bahrain",
    labelAr: "البحرين",
    currency: "BHD",
    currencyLabelEn: "Bahraini Dinar",
    currencyLabelAr: "دينار بحريني",
    dialCode: "+973",
    locale: "ar-BH",
    flag: "🇧🇭",
  },
  {
    code: "QA",
    labelEn: "Qatar",
    labelAr: "قطر",
    currency: "QAR",
    currencyLabelEn: "Qatari Riyal",
    currencyLabelAr: "ريال قطري",
    dialCode: "+974",
    locale: "ar-QA",
    flag: "🇶🇦",
  },
  {
    code: "OM",
    labelEn: "Oman",
    labelAr: "عُمان",
    currency: "OMR",
    currencyLabelEn: "Omani Rial",
    currencyLabelAr: "ريال عُماني",
    dialCode: "+968",
    locale: "ar-OM",
    flag: "🇴🇲",
  },
  {
    code: "EG",
    labelEn: "Egypt",
    labelAr: "مصر",
    currency: "EGP",
    currencyLabelEn: "Egyptian Pound",
    currencyLabelAr: "جنيه مصري",
    dialCode: "+20",
    locale: "ar-EG",
    flag: "🇪🇬",
  },
];

export const GCC_COUNTRY_CODES: GccCountry[] = GCC_COUNTRIES.map((c) => c.code);

/** Major luxury hubs — Madinah first (priority 0), then regional capitals */
export const GCC_CITIES: GccCity[] = [
  // Saudi Arabia — Madinah launch default
  { id: "madinah", country: "SA", labelEn: "Madinah", labelAr: "المدينة المنورة", priority: 0 },
  { id: "riyadh", country: "SA", labelEn: "Riyadh", labelAr: "الرياض", priority: 1 },
  { id: "jeddah", country: "SA", labelEn: "Jeddah", labelAr: "جدة", priority: 2 },
  { id: "khobar", country: "SA", labelEn: "Khobar", labelAr: "الخبر", priority: 10 },
  { id: "alula", country: "SA", labelEn: "AlUla", labelAr: "العلا", priority: 11 },
  { id: "neom", country: "SA", labelEn: "NEOM", labelAr: "نيوم", priority: 12 },
  // UAE
  { id: "dubai", country: "AE", labelEn: "Dubai", labelAr: "دبي", priority: 3 },
  { id: "abu-dhabi", country: "AE", labelEn: "Abu Dhabi", labelAr: "أبوظبي", priority: 4 },
  { id: "sharjah", country: "AE", labelEn: "Sharjah", labelAr: "الشارقة", priority: 13 },
  { id: "ras-al-khaimah", country: "AE", labelEn: "Ras Al Khaimah", labelAr: "رأس الخيمة", priority: 14 },
  { id: "palm-jumeirah", country: "AE", labelEn: "Palm Jumeirah", labelAr: "نخلة جميرا", priority: 15 },
  { id: "hatta", country: "AE", labelEn: "Hatta", labelAr: "حتا", priority: 20 },
  // Kuwait
  { id: "kuwait-city", country: "KW", labelEn: "Kuwait City", labelAr: "مدينة الكويت", priority: 5 },
  { id: "salmiya", country: "KW", labelEn: "Salmiya", labelAr: "السالمية", priority: 16 },
  { id: "messilah", country: "KW", labelEn: "Messilah", labelAr: "المسيلة", priority: 21 },
  { id: "fahaheel", country: "KW", labelEn: "Fahaheel", labelAr: "الفحيحيل", priority: 22 },
  // Bahrain
  { id: "manama", country: "BH", labelEn: "Manama", labelAr: "المنامة", priority: 6 },
  { id: "amwaj", country: "BH", labelEn: "Amwaj Islands", labelAr: "جزر أمواج", priority: 17 },
  { id: "riffa", country: "BH", labelEn: "Riffa", labelAr: "الرفاع", priority: 23 },
  { id: "muharraq", country: "BH", labelEn: "Muharraq", labelAr: "المحرق", priority: 24 },
  // Qatar
  { id: "doha", country: "QA", labelEn: "Doha", labelAr: "الدوحة", priority: 7 },
  { id: "the-pearl", country: "QA", labelEn: "The Pearl", labelAr: "اللؤلؤة", priority: 18 },
  { id: "lusail", country: "QA", labelEn: "Lusail", labelAr: "لوسيل", priority: 19 },
  { id: "al-wakra", country: "QA", labelEn: "Al Wakra", labelAr: "الوكرة", priority: 25 },
  // Oman
  { id: "muscat", country: "OM", labelEn: "Muscat", labelAr: "مسقط", priority: 8 },
  { id: "salalah", country: "OM", labelEn: "Salalah", labelAr: "صلالة", priority: 26 },
  { id: "qurayyat", country: "OM", labelEn: "Qurayyat", labelAr: "قريات", priority: 27 },
  { id: "jabal-akhdar", country: "OM", labelEn: "Al Jabal Al Akhdar", labelAr: "الجبل الأخضر", priority: 28 },
  // Egypt — luxury hubs
  { id: "cairo", country: "EG", labelEn: "Cairo", labelAr: "القاهرة", priority: 9 },
  { id: "new-cairo", country: "EG", labelEn: "New Cairo", labelAr: "القاهرة الجديدة", priority: 29 },
  { id: "sheikh-zayed", country: "EG", labelEn: "Sheikh Zayed", labelAr: "الشيخ زايد", priority: 30 },
  { id: "new-capital", country: "EG", labelEn: "New Administrative Capital", labelAr: "العاصمة الإدارية", priority: 31 },
  { id: "alexandria", country: "EG", labelEn: "Alexandria", labelAr: "الإسكندرية", priority: 32 },
  { id: "north-coast", country: "EG", labelEn: "North Coast", labelAr: "الساحل الشمالي", priority: 33 },
  { id: "el-gouna", country: "EG", labelEn: "El Gouna", labelAr: "الجونة", priority: 34 },
  { id: "ain-sokhna", country: "EG", labelEn: "Ain Sokhna", labelAr: "العين السخنة", priority: 35 },
  { id: "sharm-el-sheikh", country: "EG", labelEn: "Sharm El Sheikh", labelAr: "شرم الشيخ", priority: 36 },
  { id: "hurghada", country: "EG", labelEn: "Hurghada", labelAr: "الغردقة", priority: 37 },
];

export function isGccCountry(value: string | null | undefined): value is GccCountry {
  return !!value && (GCC_COUNTRY_CODES as string[]).includes(value);
}

export function getGccCountry(code: GccCountry): GccCountryMeta {
  return GCC_COUNTRIES.find((c) => c.code === code)!;
}

export function getGccCity(idOrLabel: string): GccCity | undefined {
  const q = idOrLabel.trim().toLowerCase();
  return GCC_CITIES.find(
    (c) =>
      c.id === q ||
      c.labelEn.toLowerCase() === q ||
      c.labelAr === idOrLabel.trim(),
  );
}

export function citiesForCountry(country: GccCountry): GccCity[] {
  return GCC_CITIES.filter((c) => c.country === country).sort(
    (a, b) => (a.priority ?? 99) - (b.priority ?? 99),
  );
}

/** Cities ordered for location pickers — Madinah first */
export function sortedGccCities(): GccCity[] {
  return [...GCC_CITIES].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
}

export function countryForLocation(location: string): GccCountry | undefined {
  return getGccCity(location)?.country;
}

export function dialCodeFor(country: GccCountry): string {
  return getGccCountry(country).dialCode;
}

export function currencyFor(country: GccCountry): GccCurrency {
  return getGccCountry(country).currency;
}
