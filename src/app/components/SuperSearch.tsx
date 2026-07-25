import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Loader2,
  MapPin,
  Filter,
  Layers,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { tOpt } from "../i18nLabel";
import {
  listSearchSources,
  superSearch,
  GCC_COUNTRIES,
  DEFAULT_GCC_CITY_LABEL,
  DEFAULT_GCC_COUNTRY,
  citiesForCountry,
  isGccCountry,
  type GccCountry,
  type AggregatedProduct,
  type AggregatedSearchResult,
} from "@marketly/core";
import { useApp } from "../AppContext";
import { HeaderControls } from "./HeaderControls";
import { VerticalSwitcher } from "./VerticalSwitcher";
import { SourceBadge } from "./SourceBadge";
import { ResponsiveSelect } from "./ResponsiveSelect";
import { formatCurrency } from "../utils";
import { toast } from "sonner";

type Props = {
  initialQ?: string;
  initialLocation?: string;
  initialCountry?: string;
  onBack: () => void;
  onOpenProduct: (ref: string) => void;
  onOpenListing: (id: number) => void;
  onOpenCart: () => void;
};

export function SuperSearch({
  initialQ = "",
  initialLocation = DEFAULT_GCC_CITY_LABEL,
  initialCountry = DEFAULT_GCC_COUNTRY,
  onBack,
  onOpenProduct,
  onOpenListing,
  onOpenCart,
}: Props) {
  const { t } = useTranslation();
  const tr = (s: string) => tOpt(t, s);
  const {
    vertical,
    cartCount,
    addCartLine,
    currency,
    country: preferredCountry,
    setCountry: setPreferredCountry,
    setCity: setPreferredCity,
  } = useApp();
  void currency; // search result prices follow active GCC currency
  const [q, setQ] = useState(initialQ);
  const [committed, setCommitted] = useState(initialQ);
  const [country, setCountry] = useState<GccCountry | "">(
    isGccCountry(initialCountry) ? initialCountry : preferredCountry,
  );
  const [location, setLocation] = useState(initialLocation || DEFAULT_GCC_CITY_LABEL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AggregatedSearchResult | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const sources = useMemo(() => listSearchSources(), []);
  const cityOptions = country ? citiesForCountry(country) : GCC_COUNTRIES.flatMap((c) => citiesForCountry(c.code));

  const prevVertical = useRef(vertical);
  useEffect(() => {
    if (prevVertical.current === vertical) return;
    prevVertical.current = vertical;
    setLocation("");
  }, [vertical]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const run = async () => {
      const base = {
        q: committed,
        vertical,
        limit: 48,
        providers: sourceFilter === "all" ? undefined : [sourceFilter],
      };
      let res = await superSearch({
        ...base,
        location: location || undefined,
        country: country || undefined,
      });
      if (!alive) return;
      // Geo filter empty for this vertical → broaden (keep inventory visible)
      if (res.products.length === 0 && (location || country)) {
        if (location) {
          res = await superSearch({ ...base, country: country || undefined });
          if (res.products.length > 0) {
            setLocation("");
            setResult(res);
            setLoading(false);
            return;
          }
        }
        if (country) {
          res = await superSearch({ ...base });
          if (res.products.length > 0) {
            setLocation("");
            setCountry("");
            setResult(res);
            setLoading(false);
            return;
          }
        }
      }
      setResult(res);
      setLoading(false);
    };
    void run();
    return () => {
      alive = false;
    };
  }, [committed, vertical, location, country, sourceFilter]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setCommitted(q.trim());
  };

  const openHit = (p: AggregatedProduct) => {
    if (p.listingId && p.providerId === "marketly") {
      onOpenListing(p.listingId);
      return;
    }
    onOpenProduct(p.ref);
  };

  const addHit = (p: AggregatedProduct) => {
    if (!p.inStock) {
      toast.error(t("super.outOfStock"));
      return;
    }
    addCartLine({
      ref: p.ref,
      providerId: p.providerId,
      providerName: p.providerName,
      externalId: p.externalId,
      listingId: p.listingId,
      title: p.title,
      price: p.price,
      image: p.image,
      vertical: p.vertical,
    });
    toast.success(t("super.addedToCart"));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="w-full max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            aria-label={t("super.back")}
          >
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent font-semibold truncate">
              {t("super.searchTitle")}
            </p>
            <p className="text-xs text-slate-500 truncate">{t("super.searchSub")}</p>
          </div>
          <div className="ms-auto flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              aria-label={t("super.cart")}
            >
              <ShoppingCart className="size-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -end-1 size-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
            <HeaderControls />
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-2 space-y-1.5">
            <div className="overflow-x-auto no-scrollbar">
              <VerticalSwitcher size="sm" className="w-full max-w-none" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 truncate">{t(`super.tagline.${vertical}`)}</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        <form
          onSubmit={submit}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("super.searchPh")}
              className="w-full ps-10 pe-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:border-blue-600"
            />
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-none sm:contents gap-2">
            <ResponsiveSelect
              value={country}
              aria-label={t("gcc.country")}
              className="sm:w-40"
              onChange={(next) => {
                if (!next) {
                  setCountry("");
                  return;
                }
                if (!isGccCountry(next)) return;
                setCountry(next);
                setPreferredCountry(next);
                const cities = citiesForCountry(next);
                if (!cities.some((c) => c.labelEn === location)) {
                  const nextCity = cities[0]?.labelEn || "";
                  setLocation(nextCity);
                  if (nextCity) setPreferredCity(nextCity);
                }
              }}
              options={[
                { value: "", label: t("gcc.allCountries") },
                ...GCC_COUNTRIES.map((c) => ({
                  value: c.code,
                  label: t(`gcc.countries.${c.code}`),
                })),
              ]}
            />
            <div className="relative sm:w-48">
              <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none z-[1]" />
              <ResponsiveSelect
                value={location}
                onChange={setLocation}
                className="ps-10"
                aria-label={t("browse.location")}
                options={[
                  { value: "", label: t("super.allLocations") },
                  ...cityOptions.map((c) => ({
                    value: c.labelEn,
                    label: t(`gcc.cities.${c.id}`, { defaultValue: c.labelEn }),
                  })),
                ]}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto min-h-11 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            {t("super.search")}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Filter className="size-3.5" /> {t("super.sources")}
          </span>
          <button
            type="button"
            onClick={() => setSourceFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs border ${
              sourceFilter === "all"
                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                : "border-slate-200 dark:border-slate-700"
            }`}
          >
            {t("super.allSources")}
          </button>
          {sources.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSourceFilter(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs border ${
                sourceFilter === s.id
                  ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Layers className="size-4" />
            {loading
              ? t("super.searching")
              : t("super.resultsMeta", {
                  count: result?.products.length ?? 0,
                  ms: result?.tookMs ?? 0,
                  sources: result?.byProvider.filter((p) => p.hits.length > 0).length ?? 0,
                })}
          </span>
          {loading && <Loader2 className="size-4 animate-spin text-blue-600" />}
        </div>

        {!loading && result && result.products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500">
            {t("super.noResults")}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(result?.products ?? []).map((p) => (
            <article
              key={p.ref}
              className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition"
            >
              <button type="button" onClick={() => openHit(p)} className="w-full text-start">
                <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 start-2">
                    <SourceBadge name={p.providerName} />
                  </div>
                  {!p.inStock && (
                    <span className="absolute bottom-2 start-2 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-semibold">
                      {t("super.outOfStock")}
                    </span>
                  )}
                  {p.duplicateCount > 1 && (
                    <span className="absolute top-2 end-2 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px]">
                      {t("super.dupes", { count: p.duplicateCount })}
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-xs text-slate-500 capitalize">
                    {t(`super.vertical.${p.vertical}`)} · {p.category}
                  </p>
                  <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{p.title}</h3>
                  <p className="text-blue-600 font-bold" dir="ltr">
                    {formatCurrency(p.price)}
                  </p>
                  <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                    <MapPin className="size-3" /> {p.location}
                  </p>
                </div>
              </button>
              <div className="px-3 pb-3">
                <button
                  type="button"
                  onClick={() => addHit(p)}
                  disabled={!p.inStock}
                  className="w-full py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium disabled:opacity-40 hover:opacity-90"
                >
                  {t("super.addToCart")}
                </button>
              </div>
            </article>
          ))}
        </div>

        {result && result.byProvider.length > 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <h2 className="font-semibold mb-3">{t("super.providerBreakdown")}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {result.byProvider.map((p) => (
                <div
                  key={p.providerId}
                  className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 text-sm"
                >
                  <p className="font-medium">{p.providerName}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {p.error
                      ? p.error
                      : t("super.providerHits", { count: p.hits.length, ms: p.tookMs })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
