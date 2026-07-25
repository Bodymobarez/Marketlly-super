import type { ProductSearchProvider } from "./types";

const providers = new Map<string, ProductSearchProvider>();

/** Register a search provider. Replaces if same id already exists. */
export function registerProvider(provider: ProductSearchProvider): void {
  providers.set(provider.id, provider);
}

export function unregisterProvider(id: string): boolean {
  return providers.delete(id);
}

export function getProvider(id: string): ProductSearchProvider | undefined {
  return providers.get(id);
}

export function listProviders(): ProductSearchProvider[] {
  return [...providers.values()];
}

export function clearProviders(): void {
  providers.clear();
}

/** Create a fresh registry scope for tests — does not clear the global map. */
export function createRegistry() {
  const map = new Map<string, ProductSearchProvider>();
  return {
    register(p: ProductSearchProvider) {
      map.set(p.id, p);
    },
    list() {
      return [...map.values()];
    },
    get(id: string) {
      return map.get(id);
    },
  };
}
