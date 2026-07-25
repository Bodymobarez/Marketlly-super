import type { TFunction } from "i18next";
import i18n from "./i18n";

/** Stable key for English UI / taxonomy labels stored under `opts.*`. */
export function slugLabel(label: string): string {
  return String(label)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80);
}

/**
 * Translate a known English UI/taxonomy label via `opts.<slug>`.
 * Brand names and unknown catalog values pass through unchanged.
 */
export function tOpt(t: TFunction, label: string): string {
  if (!label) return label;
  const key = `opts.${slugLabel(label)}`;
  if (i18n.exists(key)) return String(t(key));
  return label;
}
