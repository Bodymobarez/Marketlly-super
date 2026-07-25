import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  cartApi,
  citiesForCountry,
  currencyFor,
  DEFAULT_GCC_CITY_LABEL,
  DEFAULT_GCC_COUNTRY,
  ensureSearchProviders,
  getGccCity,
  isGccCountry,
  type CartLine,
  type CartSnapshot,
  type GccCountry,
  type GccCurrency,
  normalizeVertical,
  type ShoppingVertical,
} from "@marketly/core";
import { localeForCountry, syncMoneyDisplay } from "./utils";

type Theme = "light" | "dark";
type Lang = "en" | "ar";
type Ctx = {
  theme: Theme;
  toggleTheme: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  favorites: number[];
  toggleFavorite: (id: number) => void;
  vertical: ShoppingVertical;
  setVertical: (v: ShoppingVertical) => void;
  /** Preferred GCC country — drives active currency for all product prices */
  country: GccCountry;
  city: string;
  currency: GccCurrency;
  setCountry: (c: GccCountry) => void;
  setCity: (city: string) => void;
  setLocation: (country: GccCountry, city?: string) => void;
  cart: CartSnapshot;
  cartCount: number;
  addCartLine: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setCartQty: (ref: string, quantity: number) => void;
  clearCart: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

const LS_COUNTRY = "marketly-gcc-country";
const LS_CITY = "marketly-gcc-city";

function lngToLang(lng?: string): Lang {
  return lng?.startsWith("ar") ? "ar" : "en";
}

function readVertical(): ShoppingVertical {
  return normalizeVertical(localStorage.getItem("marketly-vertical"));
}

function readCountry(): GccCountry {
  const saved = localStorage.getItem(LS_COUNTRY);
  return isGccCountry(saved) ? saved : DEFAULT_GCC_COUNTRY;
}

function readCity(country: GccCountry): string {
  const saved = localStorage.getItem(LS_CITY);
  if (saved) {
    const meta = getGccCity(saved);
    if (meta && meta.country === country) return meta.labelEn;
    if (citiesForCountry(country).some((c) => c.labelEn === saved)) return saved;
  }
  const cities = citiesForCountry(country);
  const preferred = cities.find((c) => c.labelEn === DEFAULT_GCC_CITY_LABEL);
  return preferred?.labelEn || cities[0]?.labelEn || DEFAULT_GCC_CITY_LABEL;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("marketly-theme");
    return saved === "dark" ? "dark" : "light";
  });
  const [lang, setLangState] = useState<Lang>(() => lngToLang(i18n.language));
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem("marketly-favorites");
      if (raw) {
        const parsed = JSON.parse(raw) as number[];
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {
      /* ignore */
    }
    // Madinah-first demo wishlist (cars + villa)
    return [1, 2, 5];
  });
  const [vertical, setVerticalState] = useState<ShoppingVertical>(readVertical);
  const [country, setCountryState] = useState<GccCountry>(readCountry);
  const [city, setCityState] = useState(() => readCity(readCountry()));
  const [cart, setCart] = useState<CartSnapshot>(() => cartApi.getCartSync());

  const currency = currencyFor(country);

  useEffect(() => {
    ensureSearchProviders();
  }, []);

  useEffect(() => {
    localStorage.setItem("marketly-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("marketly-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("marketly-vertical", vertical);
  }, [vertical]);

  useEffect(() => {
    localStorage.setItem(LS_COUNTRY, country);
    localStorage.setItem(LS_CITY, city);
    syncMoneyDisplay(currency, localeForCountry(country, lang));
  }, [country, city, currency, lang]);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    if (lngToLang(i18n.language) !== lang) {
      void i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  useEffect(() => {
    const onChange = (lng: string) => setLangState(lngToLang(lng));
    i18n.on("languageChanged", onChange);
    return () => {
      i18n.off("languageChanged", onChange);
    };
  }, [i18n]);

  useEffect(() => cartApi.subscribeCart(() => setCart(cartApi.getCartSync())), []);

  const setLang = (l: Lang) => {
    setLangState(l);
    void i18n.changeLanguage(l);
  };
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const toggleFavorite = (id: number) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const setVertical = (v: ShoppingVertical) => setVerticalState(v);

  const setCountry = (code: GccCountry) => {
    setCountryState(code);
    const cities = citiesForCountry(code);
    setCityState((prev) => {
      if (cities.some((c) => c.labelEn === prev)) return prev;
      return cities[0]?.labelEn || DEFAULT_GCC_CITY_LABEL;
    });
  };

  const setCity = (next: string) => {
    const meta = getGccCity(next);
    if (meta) {
      setCountryState(meta.country);
      setCityState(meta.labelEn);
      return;
    }
    setCityState(next);
  };

  const setLocation = (code: GccCountry, nextCity?: string) => {
    setCountryState(code);
    const cities = citiesForCountry(code);
    if (nextCity && cities.some((c) => c.labelEn === nextCity || c.id === nextCity)) {
      const match = cities.find((c) => c.labelEn === nextCity || c.id === nextCity);
      setCityState(match?.labelEn || cities[0]?.labelEn || DEFAULT_GCC_CITY_LABEL);
      return;
    }
    setCityState(cities[0]?.labelEn || DEFAULT_GCC_CITY_LABEL);
  };

  const addCartLine = (line: Omit<CartLine, "quantity"> & { quantity?: number }) => {
    setCart(cartApi.addToCart(line));
  };
  const setCartQty = (ref: string, quantity: number) => {
    setCart(cartApi.setCartQuantity(ref, quantity));
  };
  const clearCart = () => setCart(cartApi.clearCart());

  return (
    <AppCtx.Provider
      value={{
        theme,
        toggleTheme,
        lang,
        setLang,
        favorites,
        toggleFavorite,
        vertical,
        setVertical,
        country,
        city,
        currency,
        setCountry,
        setCity,
        setLocation,
        cart,
        cartCount: cart.lines.reduce((n, l) => n + l.quantity, 0),
        addCartLine,
        setCartQty,
        clearCart,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

const fallbackCountry = DEFAULT_GCC_COUNTRY;
const fallback: Ctx = {
  theme: "light",
  toggleTheme: () => {},
  lang: "ar",
  setLang: () => {},
  favorites: [],
  toggleFavorite: () => {},
  vertical: "super",
  setVertical: () => {},
  country: fallbackCountry,
  city: DEFAULT_GCC_CITY_LABEL,
  currency: currencyFor(fallbackCountry),
  setCountry: () => {},
  setCity: () => {},
  setLocation: () => {},
  cart: { lines: [], updatedAt: 0 },
  cartCount: 0,
  addCartLine: () => {},
  setCartQty: () => {},
  clearCart: () => {},
};

export const useApp = () => useContext(AppCtx) ?? fallback;
