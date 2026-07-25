/** Lightweight mobile i18n — defaults to Arabic; mirrors web keys where practical. */
export type MobileLang = "ar" | "en";

const strings = {
  ar: {
    brand: "Marketly",
    heroFallback: "أفضل مكان للشراء والبيع في الإمارات",
    loading: "جارٍ التحميل…",
    home: "الرئيسية",
    browse: "تصفح",
    post: "انشر",
    browseListings: "تصفح الإعلانات",
    notFound: "غير موجود",
    contactSeller: "تواصل مع البائع",
    postAd: "انشر إعلاناً",
    title: "العنوان",
    priceAed: "السعر (درهم)",
    titlePh: "ماذا تبيع؟",
    checkFields: "تحقق من الحقول",
    titlePriceRequired: "العنوان (8 أحرف فأكثر) والسعر مطلوبان.",
    posted: "تم النشر",
    pendingReview: "قيد المراجعة",
    liveNow: "منشور الآن",
    back: "رجوع",
    aed: "درهم",
    saving: "جارٍ الحفظ…",
    publish: "نشر",
    error: "خطأ",
    homeLink: "‹ الرئيسية",
    backLink: "‹ رجوع",
  },
  en: {
    brand: "Marketly",
    heroFallback: "The best place to buy & sell in the UAE",
    loading: "Loading…",
    home: "Home",
    browse: "Browse",
    post: "Post",
    browseListings: "Browse listings",
    notFound: "Not found",
    contactSeller: "Contact seller",
    postAd: "Post ad",
    title: "Title",
    priceAed: "Price (AED)",
    titlePh: "What are you selling?",
    checkFields: "Check fields",
    titlePriceRequired: "Title (8+ chars) and price are required.",
    posted: "Posted",
    pendingReview: "Pending review",
    liveNow: "Live now",
    back: "Back",
    aed: "AED",
    saving: "Saving…",
    publish: "Publish",
    error: "Error",
    homeLink: "‹ Home",
    backLink: "‹ Back",
  },
} as const;

export type MobileKey = keyof typeof strings.ar;

let lang: MobileLang = "ar";

export function setMobileLang(next: MobileLang) {
  lang = next;
}

export function getMobileLang() {
  return lang;
}

export function t(key: MobileKey): string {
  return strings[lang][key] ?? strings.ar[key] ?? key;
}
