import type { GccCurrency } from "./data";
import { getGccCountry, type GccCountry } from "./data";

/**
 * Catalog / cart / auction amounts are stored in SAR (Saudi Riyal).
 * Display converts via DEMO_FX when the shopper’s GCC country changes.
 * Rates are approximate constants for mock/demo — not live FX.
 */
export const BASE_CURRENCY: GccCurrency = "SAR";

/** Units of each currency per 1 SAR (approx. demo pegs). */
export const DEMO_FX_FROM_SAR: Record<GccCurrency, number> = {
  SAR: 1,
  AED: 0.979,
  QAR: 0.971,
  KWD: 0.0827,
  BHD: 0.1013,
  OMR: 0.1027,
  /** Approx. demo — ~13.5 EGP per 1 SAR */
  EGP: 13.5,
};

const FRACTION_DIGITS: Record<GccCurrency, number> = {
  SAR: 0,
  AED: 0,
  QAR: 0,
  KWD: 3,
  BHD: 3,
  OMR: 3,
  EGP: 0,
};

export function convertPrice(
  amount: number,
  from: GccCurrency,
  to: GccCurrency,
): number {
  if (!Number.isFinite(amount)) return 0;
  if (from === to) return amount;
  const inSar = amount / DEMO_FX_FROM_SAR[from];
  return inSar * DEMO_FX_FROM_SAR[to];
}

/** Convert a base-currency (SAR) amount into the active display currency. */
export function fromBase(amount: number, to: GccCurrency): number {
  return convertPrice(amount, BASE_CURRENCY, to);
}

/** Convert a display-currency amount back to base (SAR). */
export function toBase(amount: number, from: GccCurrency): number {
  return convertPrice(amount, from, BASE_CURRENCY);
}

export function formatMoney(
  amount: number,
  currency: GccCurrency,
  locale = "en",
): string {
  const digits = FRACTION_DIGITS[currency] ?? 0;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: digits,
      minimumFractionDigits: digits === 3 ? 0 : 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(locale)}`;
  }
}

/** Format a SAR-stored amount in the currency of a GCC country. */
export function formatPriceForCountry(
  amountInBase: number,
  country: GccCountry,
  locale = "en",
): string {
  const currency = getGccCountry(country).currency;
  return formatMoney(fromBase(amountInBase, currency), currency, locale);
}
