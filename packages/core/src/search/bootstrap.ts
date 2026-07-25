import { clearProviders, registerProvider, listProviders } from "./registry";
import { createInternalCatalogProvider } from "./providers/internalCatalog";
import {
  createMarinaHubProvider,
  createPalmLuxeProvider,
  createRoyalGarageProvider,
} from "./providers/mockCatalog";

let bootstrapped = false;

/**
 * Registers the default Super Luxury search stack:
 * Marketly catalog + MarinaHub + PalmLuxe + Royal Garage (mock partners).
 * Safe to call multiple times — only registers once unless `force`.
 */
export function bootstrapSearchProviders(force = false): void {
  if (bootstrapped && !force) return;
  if (force) clearProviders();
  registerProvider(createInternalCatalogProvider());
  registerProvider(createMarinaHubProvider());
  registerProvider(createPalmLuxeProvider());
  registerProvider(createRoyalGarageProvider());
  bootstrapped = true;
}

export function ensureSearchProviders(): void {
  if (!bootstrapped || listProviders().length === 0) {
    bootstrapSearchProviders(true);
  }
}
