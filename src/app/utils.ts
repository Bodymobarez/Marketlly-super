import {
  BASE_CURRENCY,
  convertPrice,
  currencyFor,
  formatMoney,
  getGccCountry,
  isGccCountry,
  type GccCurrency,
} from "@marketly/core";
import i18n from "./i18n";

function bootCurrency(): GccCurrency {
  try {
    const saved = localStorage.getItem("marketly-gcc-country");
    if (isGccCountry(saved)) return currencyFor(saved);
  } catch {
    /* ignore */
  }
  return "SAR";
}

/** Active shopper display currency — synced from AppContext when GCC country changes. */
let displayCurrency: GccCurrency = bootCurrency();
let displayLocale = "ar-SA";

export function syncMoneyDisplay(currency: GccCurrency, locale?: string) {
  displayCurrency = currency;
  if (locale) displayLocale = locale;
}

export function getDisplayCurrency(): GccCurrency {
  return displayCurrency;
}

function resolveLocale(explicit?: string): string {
  if (explicit) return explicit;
  if (displayLocale) return displayLocale;
  return i18n.language === "ar" ? "ar-SA" : "en-SA";
}

/**
 * Format a catalog/cart amount for the UI.
 * Amounts are stored in BASE_CURRENCY (SAR) and converted to the active GCC currency
 * unless `opts.from` / `opts.convert: false` override that.
 */
export function formatCurrency(
  amount: number,
  currency?: string,
  opts?: { from?: GccCurrency; convert?: boolean; locale?: string },
) {
  const from = opts?.from ?? BASE_CURRENCY;
  const to = ((currency as GccCurrency) || displayCurrency) as GccCurrency;
  const value = opts?.convert === false ? amount : convertPrice(amount, from, to);
  return formatMoney(value, to, resolveLocale(opts?.locale));
}

export function formatCompact(amount: number) {
  const locale = resolveLocale();
  try {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return amount.toLocaleString();
  }
}

export function formatDate(ts: number | string | Date) {
  const locale = resolveLocale();
  const d = typeof ts === "number" || typeof ts === "string" ? new Date(ts) : ts;
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

export function formatRelative(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(ts);
}

export function localeForCountry(countryCode: string, lang: "en" | "ar"): string {
  if (!countryCode) return lang === "ar" ? "ar-SA" : "en-SA";
  const meta = getGccCountry(countryCode as Parameters<typeof getGccCountry>[0]);
  return lang === "ar" ? meta.locale : meta.locale.replace(/^ar-/, "en-");
}
