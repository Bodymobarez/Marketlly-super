import { useEffect, useState } from "react";
import {
  Search, MapPin, Bell, BookmarkCheck, Heart, MessageCircle, UserCog, X,
  Car, ArrowRight, Gavel, Ship, Anchor, Home, Landmark, Mountain, Smartphone,
  ChevronDown, User, Globe, FileText, BadgeCheck, Calendar, Wrench, Bookmark, Settings, LogOut, ShieldCheck,
  ShoppingCart, Layers, Menu,
} from "lucide-react";
import { useAuction, getStatus, useCountdown } from "../AuctionContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { HeaderControls } from "./HeaderControls";
import { HeroSlider } from "./HeroSlider";
import { VerticalSwitcher } from "./VerticalSwitcher";
import { MotorsMenu } from "./MotorsMenu";
import { ClassifiedsMenu } from "./ClassifiedsMenu";
import { MobileSheet } from "./MobileSheet";
import { ResponsiveSelect } from "./ResponsiveSelect";
import { useApp } from "../AppContext";
import {
  matchesVertical,
  GCC_COUNTRIES,
  citiesForCountry,
  isGccCountry,
  LUXURY_CATEGORIES,
  type LuxuryCategory,
  type ShoppingVertical,
} from "@marketly/core";
import { useAuth } from "../AuthContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Editable } from "./Editable";
import { Banners } from "./Banners";
import { getListings } from "../data";
import { useRecentlyViewed } from "../hooks";
import { formatCurrency } from "../utils";
import { tOpt } from "../i18nLabel";

type Props = {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  user: { name: string; role: string } | null;
  onLogout: () => void;
};

const popular: { id: string; label: string; icon: typeof Car; category: string; items: string[] }[] = [
  { id: "yachts", label: "Yachts", icon: Anchor, category: "yachts", items: ["Dubai Marina", "Palm Berths", "Explorer Yachts", "Flybridge"] },
  { id: "boats", label: "Boats", icon: Ship, category: "boats", items: ["Day Cruisers", "Sport Boats", "Walkaround", "Cabin"] },
  { id: "villas", label: "Villas", icon: Home, category: "villas", items: ["Palm Jumeirah", "Emirates Hills", "Saadiyat", "Waterfront"] },
  { id: "palaces", label: "Palaces", icon: Landmark, category: "palaces", items: ["Royal Compounds", "Corniche", "District One", "Ultra Prime"] },
  { id: "chalets", label: "Chalets", icon: Mountain, category: "chalets", items: ["Beach", "Desert", "Hatta", "Island"] },
  { id: "cars", label: "Cars", icon: Car, category: "cars", items: ["Hypercars", "G-Class", "Maybach", "Collectors"] },
];

const navCats = [
  { id: "motors", label: "Motors", badge: "" },
  { id: "classifieds", label: "Classifieds", badge: "" },
  { id: "auction", label: "Cars Auction", badge: "LIVE" },
];

/** Search card "Searching In" tabs — All = multi-source; others = category filter */
type SearchTabId = "all" | LuxuryCategory;
const SEARCH_TABS: SearchTabId[] = ["all", "yachts", "villas", "cars", "boats", "palaces", "chalets"];

function isLuxuryCategory(value: string): value is LuxuryCategory {
  return (LUXURY_CATEGORIES as readonly string[]).includes(value);
}

// ─── Live Auctions Section ────────────────────────────────────────────────────

function AuctionCountdown({ endTime }: { endTime: number }) {
  const { t } = useTranslation();
  const tr = (s: string) => tOpt(t, s);
  const { days, hours, minutes, seconds, isExpired } = useCountdown(endTime);
  if (isExpired) return <span className="text-red-400 text-xs">{t("common.ended")}</span>;
  const urgent = days === 0 && hours === 0 && minutes < 30;
  const parts = days > 0 ? `${days}${t("auction.unitD")} ${hours}${t("auction.unitH")} ${minutes}${t("auction.unitM")}` : hours > 0 ? `${hours}${t("auction.unitH")} ${minutes}${t("auction.unitM")} ${seconds}${t("auction.unitS")}` : `${minutes}${t("auction.unitM")} ${seconds}${t("auction.unitS")}`;
  return <span className={`font-mono text-xs tabular-nums ${urgent ? "text-red-400 font-bold" : "text-white/70"}`}>{parts}</span>;
}

function LiveAuctionsSection({
  onNavigate,
  category,
}: {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  category?: LuxuryCategory | null;
}) {
  const { t } = useTranslation();
  const tr = (s: string) => tOpt(t, s);
  const { currency } = useApp();
  const { auctions } = useAuction();
  // Prefer one live lot per Super Luxury category for hub variety (or filter by active tab)
  const liveAuctions = (() => {
    const live = auctions.filter((a) => {
      if (getStatus(a) !== "live") return false;
      if (!category) return true;
      return (a.category ?? "cars") === category;
    });
    const picked: typeof live = [];
    const seen = new Set<string>();
    for (const a of live) {
      const cat = a.category ?? "cars";
      if (!seen.has(cat)) {
        seen.add(cat);
        picked.push(a);
      }
      if (picked.length >= 4) break;
    }
    for (const a of live) {
      if (picked.length >= 4) break;
      if (!picked.includes(a)) picked.push(a);
    }
    return picked;
  })();
  void currency; // re-render prices when GCC country/currency changes
  if (liveAuctions.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Gavel className="size-4 text-white" />
          </div>
          <div>
            <h2 className="tracking-tight flex items-center gap-2">
              {t("auction.statLiveAuctions")}
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-600 text-white font-medium">
                <span className="size-1.5 rounded-full bg-white animate-pulse" />{liveAuctions.length} {t("common.live")}
              </span>
            </h2>
            <p className="text-xs text-slate-500">{t("common.auctionSub")}</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate("auction")}
          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          {t("common.viewAll")} <ArrowRight className="size-3.5 rtl:rotate-180" />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {liveAuctions.map((a) => (
          <button
            key={a.id}
            onClick={() => onNavigate("auction-detail", { id: a.id })}
            className="group text-start rounded-2xl overflow-hidden border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
              <img src={a.images[0]} alt={a.title} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-2 start-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase">
                <span className="size-1.5 rounded-full bg-white animate-pulse" />{t("auction.statusLive")}
              </div>
              {a.featured && (
                <div className="absolute top-2 end-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-semibold">★</div>
              )}
              <div className="absolute bottom-2 start-2 end-2 flex items-center justify-between">
                <span className="text-white font-bold text-sm tabular-nums" dir="ltr">{formatCurrency(a.currentBid)}</span>
                <AuctionCountdown endTime={a.endTime} />
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold truncate">{a.title}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500">{a.bids.length} {t("auction.bids")} · {a.watchers} {t("auction.watching")}</span>
                <span className="text-xs text-blue-600 font-medium group-hover:underline">{t("auction.bidNow")}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function Landing({ onNavigate, user, onLogout }: Props) {
  const { t } = useTranslation();
  const tr = (s: string) => tOpt(t, s);
  const { lang, vertical, cartCount, country, city, currency, setCountry, setCity, setVertical } = useApp();
  const { can, user: session } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [tab, setTab] = useState<SearchTabId>(() =>
    isLuxuryCategory(vertical) ? vertical : "all",
  );
  const [motorsOpen, setMotorsOpen] = useState(false);
  const [classifiedsOpen, setClassifiedsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<"motors" | "classifieds" | "geo" | "profile" | null>(null);

  // Keep Searching In tab in sync with VerticalSwitcher (and vice versa via selectTab)
  useEffect(() => {
    if (vertical === "super") setTab("all");
    else if (isLuxuryCategory(vertical)) setTab(vertical);
  }, [vertical]);

  const selectTab = (id: SearchTabId) => {
    setTab(id);
    const nextVertical: ShoppingVertical = id === "all" ? "super" : id;
    if (vertical !== nextVertical) setVertical(nextVertical);
  };

  const activeCategory: LuxuryCategory | null = tab === "all" ? null : tab;

  const categoryAllowed = (id: string) => {
    if (!session || session.role === "admin") return true;
    const map: Record<string, Parameters<typeof can>[0]> = {
      motors: "canBrowseMotors",
      classifieds: "canBrowseClassifieds",
      auction: "canBrowseAuctions",
    };
    const key = map[id];
    return key ? can(key) : true;
  };
  const visibleNavCats = navCats.filter((c) => categoryAllowed(c.id));
  const [query, setQuery] = useState("");
  const cityOptions = citiesForCountry(country);
  const { ids: recentIds } = useRecentlyViewed();
  const allListings = getListings().filter((l) =>
    matchesVertical(l.vertical, vertical, String(l.category)),
  );
  const featuredListings = allListings.slice(0, 4);
  const visiblePopular = activeCategory
    ? popular.filter((p) => p.category === activeCategory)
    : popular;
  const recent = recentIds.map((id) => allListings.find((l) => l.id === id)).filter(Boolean) as typeof allListings;

  const pickCountry = (code: string) => {
    if (!isGccCountry(code)) return;
    setCountry(code);
  };

  const search = () => {
    const geo = {
      ...(city ? { location: city } : {}),
      country,
    };
    // All → multi-source search (no category). Category tab → browse with category + geo.
    if (tab === "all") {
      onNavigate("search", { q: query, ...geo });
      return;
    }
    onNavigate("browse", { q: query, category: tab, ...geo });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {showBanner && (
        <div className="bg-white border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 relative">
            <p className="text-sm text-center text-slate-700 dark:text-slate-300">
{t("common.verifyBanner")}
            </p>
            <button
              onClick={() => toast.success(t("common.verificationStarted"))}
              className="bg-[#3b6dd8] text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 whitespace-nowrap"
            >
              {t("common.verifyNow")}
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label={t("common.close")}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-40">
        {/* Row 1 — Brand + language/theme + primary CTA */}
        <div className="w-full px-3 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="md:hidden min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            aria-label={t("common.menu", { defaultValue: "Menu" })}
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-5" />
          </button>

          <button onClick={() => onNavigate("landing")} className="flex items-center gap-2 min-w-0 shrink-0">
            <span className="tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent text-2xl sm:text-[32px] font-[Agu_Display] font-bold truncate">
              {t("brand")}
            </span>
          </button>

          <nav className="hidden xl:flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 ms-4 min-w-0 flex-1 justify-end">
            <button onClick={() => onNavigate("search")} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white text-blue-600 dark:text-blue-400 whitespace-nowrap">
              <Layers className="size-4" /> {t("super.searchNav")}
            </button>
            <button onClick={() => onNavigate("cart")} className="relative flex items-center gap-1 hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
              <ShoppingCart className="size-4" /> {t("super.cart")}
              {cartCount > 0 && (
                <span className="absolute -top-2 -end-3 size-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
            <button onClick={() => toast(t("common.noNotifications"))} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
              <Bell className="size-4" /> {t("common.notifications")}
            </button>
            <button onClick={() => onNavigate("browse")} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
              <BookmarkCheck className="size-4" /> {t("common.mySearches")}
            </button>
            <button onClick={() => onNavigate("browse")} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
              <Heart className="size-4" /> {t("common.favorites")}
            </button>
            <button onClick={() => toast(t("common.openingChats"))} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
              <MessageCircle className="size-4" /> {t("common.chats")}
            </button>
            {user ? (
              <div
                className="relative"
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <button className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white">
                  <span className="size-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className={`size-3 text-blue-600 transition ${profileOpen ? "rotate-180" : ""}`} />
                </button>
                {profileOpen && (
                  <div className="absolute end-0 top-full pt-2 z-50">
                    <div className="w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                      <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="size-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate text-slate-900 dark:text-slate-100">{user.name}</span>
                      </div>
                      {user.role === "admin" && (
                        <>
                          <button
                            onClick={() => { setProfileOpen(false); onNavigate("admin"); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-start bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:opacity-95 border-b border-slate-100 dark:border-slate-800"
                          >
                            <ShieldCheck className="size-4" />
                            <span className="flex-1 truncate">{t("common.adminPanel")}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20">{tOpt(t,"ADMIN")}</span>
                          </button>
                          <button
                            onClick={() => { setProfileOpen(false); onNavigate("mobile-android"); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
                          >
                            <Smartphone className="size-4 text-emerald-600" />
                            <span className="flex-1 truncate text-sm">{t("common.androidPreview")}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">APK</span>
                          </button>
                          <button
                            onClick={() => { setProfileOpen(false); onNavigate("mobile-ios"); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
                          >
                            <Smartphone className="size-4 text-blue-500" />
                            <span className="flex-1 truncate text-sm">{t("common.iosPreview")}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">IPA</span>
                          </button>
                        </>
                      )}
                      {[
                        { icon: User, label: "My Profile" },
                        { icon: Globe, label: "My Public Profile" },
                        { icon: FileText, label: "My Ads" },
                        { icon: BadgeCheck, label: "Get Verified", verified: true },
                        { icon: MessageCircle, label: "Chats" },
                        { icon: Heart, label: "Favorites" },
                        { icon: BookmarkCheck, label: "My Searches" },
                        { icon: Calendar, label: "Car Appointments", badge: "NEW" },
                        { icon: Wrench, label: "Car Inspections", badge: "NEW" },
                        { icon: Bookmark, label: "My Bookmarks" },
                        { icon: Settings, label: "Account Settings" },
                      ].map((it) => (
                        <button
                          key={it.label}
                          onClick={() => { setProfileOpen(false); toast(tOpt(t, it.label)); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 last:border-0"
                        >
                          <it.icon className="size-4 text-slate-500" />
                          <span className="flex-1 truncate">{tOpt(t, it.label)}</span>
                          {it.verified && <BadgeCheck className="size-4 text-blue-600 fill-blue-600 text-white" />}
                          {it.badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white">{t("common.newBadge")}</span>}
                        </button>
                      ))}
                      <button
                        onClick={() => { setProfileOpen(false); onLogout(); toast.success(tOpt(t, "Signed out")); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      >
                        <LogOut className="size-4 text-slate-500" />
                        <span>{t("common.signOut")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => onNavigate("auth")} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white whitespace-nowrap">
                <UserCog className="size-4" /> {t("common.login")}
              </button>
            )}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 ms-auto xl:ms-0 shrink-0">
            <HeaderControls />
            {session && can("canPostAuction") && (session.role === "dealer" || session.role === "admin") && (
              <button
                onClick={() => onNavigate("post")}
                className="min-h-10 px-2.5 sm:px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30 whitespace-nowrap text-sm font-medium inline-flex items-center gap-1.5"
              >
                <Gavel className="size-3.5" />
                <span className="hidden sm:inline">{t("common.postCarAuction")}</span>
              </button>
            )}
            {(!session || can("canPostAds")) && (
              <button
                onClick={() => onNavigate("post")}
                className="min-h-10 px-3 sm:px-4 py-2 rounded-lg bg-[#2563eb] text-white hover:bg-[#1d4ed8] whitespace-nowrap text-sm"
              >
                <span className="sm:hidden">{t("nav.post")}</span>
                <span className="hidden sm:inline">
                  <Editable id="landing.placeAdBtn" page="Landing" label="Place Your Ad Button" defaultValue={t("common.placeYourAd")} />
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2 — Geo + VerticalSwitcher */}
        <div className="border-t border-slate-200 dark:border-slate-800">
          <div className="w-full px-3 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-slate-700 dark:text-slate-200 px-1 py-0.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 min-w-0 shrink-0">
              <MapPin className="size-4 text-slate-400 shrink-0" />
              <ResponsiveSelect
                value={country}
                onChange={pickCountry}
                aria-label={t("gcc.country")}
                className="!min-h-9 !py-1.5 !rounded-lg border-0 bg-transparent dark:bg-transparent max-w-[7.5rem] pe-7"
                options={GCC_COUNTRIES.map((c) => ({
                  value: c.code,
                  label: t(`gcc.countries.${c.code}`),
                }))}
              />
              <ResponsiveSelect
                value={city}
                onChange={setCity}
                aria-label={t("browse.location")}
                className="!min-h-9 !py-1.5 !rounded-lg border-0 bg-transparent dark:bg-transparent max-w-[9rem] pe-7"
                options={cityOptions.map((c) => ({
                  value: c.labelEn,
                  label: t(`gcc.cities.${c.id}`, { defaultValue: c.labelEn }),
                }))}
              />
              <span className="text-xs font-semibold text-blue-600 tabular-nums ms-1" dir="ltr" title={t("gcc.currency")}>
                {currency}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMobileSheet("geo")}
              className="md:hidden w-full inline-flex items-center gap-2 min-h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200"
              aria-label={t("gcc.country")}
            >
              <MapPin className="size-4 shrink-0 text-slate-400" />
              <span className="truncate flex-1 text-start">{t(`gcc.countries.${country}`)}</span>
              <span className="text-xs text-slate-500 truncate max-w-[40%]">{city}</span>
              <span className="text-blue-600 font-semibold tabular-nums shrink-0" dir="ltr">
                {currency}
              </span>
              <ChevronDown className="size-4 shrink-0 text-slate-400" />
            </button>

            <div className="min-w-0 flex-1 overflow-x-auto no-scrollbar">
              <VerticalSwitcher size="sm" className="w-full max-w-none" />
            </div>
          </div>
        </div>

        {/* Row 3 — Category nav (desktop mega / mobile chips) */}
        <div className="border-t border-slate-200 dark:border-slate-800 relative hidden md:block">
          <div className="w-full px-6 h-12 flex items-center gap-6 text-slate-700 dark:text-slate-200 relative overflow-x-auto no-scrollbar">
            {visibleNavCats.map((c) => {
              const isMotors = c.id === "motors";
              const isClassifieds = c.id === "classifieds";
              const isAuction = c.id === "auction";
              const open = (isMotors && motorsOpen) || (isClassifieds && classifiedsOpen);
              return (
                <div
                  key={c.id}
                  className="relative shrink-0"
                  onMouseEnter={() => {
                    if (isMotors) setMotorsOpen(true);
                    if (isClassifieds) setClassifiedsOpen(true);
                  }}
                  onMouseLeave={() => {
                    if (isMotors) setMotorsOpen(false);
                    if (isClassifieds) setClassifiedsOpen(false);
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (isAuction) {
                        onNavigate("auction");
                        return;
                      }
                      onNavigate("browse", { category: c.id });
                    }}
                    className={`flex items-center gap-2 whitespace-nowrap hover:text-blue-600 h-12 ${open ? "text-[#2563eb]" : ""} ${isAuction ? "text-red-600 hover:text-red-700 font-semibold" : ""}`}
                  >
                    {isAuction && <span className="size-1.5 rounded-full bg-red-600 animate-pulse" />}
                    {isAuction ? t("nav.auction") : tOpt(t, c.label)}
                    {c.badge && !isAuction && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[#2563eb] text-white">{c.badge}</span>
                    )}
                    {isAuction && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-600 text-white">
                        {t("auction.statusLive")}
                      </span>
                    )}
                  </button>
                  {isMotors && motorsOpen && (
                    <MotorsMenu
                      variant="dropdown"
                      onPick={(p) => onNavigate("browse", p)}
                      onClose={() => setMotorsOpen(false)}
                    />
                  )}
                  {isClassifieds && classifiedsOpen && (
                    <ClassifiedsMenu
                      variant="dropdown"
                      onPick={(p) => onNavigate("browse", p)}
                      onClose={() => setClassifiedsOpen(false)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:hidden border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto no-scrollbar">
            {visibleNavCats.map((c) => {
              const isMotors = c.id === "motors";
              const isClassifieds = c.id === "classifieds";
              const isAuction = c.id === "auction";
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    if (isAuction) {
                      onNavigate("auction");
                      return;
                    }
                    if (isMotors) {
                      setMobileSheet("motors");
                      return;
                    }
                    if (isClassifieds) {
                      setMobileSheet("classifieds");
                      return;
                    }
                    onNavigate("browse", { category: c.id });
                  }}
                  className={`shrink-0 min-h-10 px-3 rounded-full text-sm border inline-flex items-center gap-1.5 ${
                    isAuction
                      ? "border-red-200 text-red-600 bg-red-50 dark:bg-red-950/30 dark:border-red-900 font-semibold"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {isAuction && <Gavel className="size-3.5" />}
                  {isAuction ? t("nav.auction") : tOpt(t, c.label)}
                  {(isMotors || isClassifieds) && <ChevronDown className="size-3.5 opacity-60" />}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <MobileSheet
        open={mobileSheet === "geo"}
        onClose={() => setMobileSheet(null)}
        title={t("gcc.country")}
        size="bottom"
      >
        <div className="space-y-4 pb-2">
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">{t("gcc.country")}</label>
            <ResponsiveSelect
              value={country}
              onChange={pickCountry}
              aria-label={t("gcc.country")}
              options={GCC_COUNTRIES.map((c) => ({
                value: c.code,
                label: t(`gcc.countries.${c.code}`),
              }))}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">{t("browse.location")}</label>
            <ResponsiveSelect
              value={city}
              onChange={setCity}
              aria-label={t("browse.location")}
              options={cityOptions.map((c) => ({
                value: c.labelEn,
                label: t(`gcc.cities.${c.id}`, { defaultValue: c.labelEn }),
              }))}
            />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t("gcc.currency")}:{" "}
            <span className="font-semibold text-blue-600" dir="ltr">
              {currency}
            </span>
          </p>
          <button
            type="button"
            onClick={() => setMobileSheet(null)}
            className="w-full min-h-11 rounded-xl bg-blue-600 text-white font-medium"
          >
            {t("common.done", { defaultValue: "Done" })}
          </button>
        </div>
      </MobileSheet>

      <MobileSheet
        open={mobileSheet === "motors"}
        onClose={() => setMobileSheet(null)}
        title={tOpt(t, "Motors")}
        size="full"
      >
        <MotorsMenu
          variant="sheet"
          onPick={(p) => onNavigate("browse", p)}
          onClose={() => setMobileSheet(null)}
        />
      </MobileSheet>

      <MobileSheet
        open={mobileSheet === "classifieds"}
        onClose={() => setMobileSheet(null)}
        title={tOpt(t, "Classifieds")}
        size="full"
      >
        <ClassifiedsMenu
          variant="sheet"
          onPick={(p) => onNavigate("browse", p)}
          onClose={() => setMobileSheet(null)}
        />
      </MobileSheet>

      <MobileSheet
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        title={t("brand")}
        size="full"
      >
        <div className="space-y-1 pb-6">
          <button
            type="button"
            className="w-full min-h-12 px-3 rounded-xl text-start hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3"
            onClick={() => {
              setMobileNavOpen(false);
              setMobileSheet("geo");
            }}
          >
            <MapPin className="size-4 text-slate-400" />
            <span className="flex-1 truncate">
              {t(`gcc.countries.${country}`)} · {city}
            </span>
            <span className="text-blue-600 text-sm font-semibold" dir="ltr">
              {currency}
            </span>
          </button>
          <button
            type="button"
            className="w-full min-h-12 px-3 rounded-xl text-start hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3"
            onClick={() => {
              setMobileNavOpen(false);
              onNavigate("search");
            }}
          >
            <Layers className="size-4" /> {t("super.searchNav")}
          </button>
          <button
            type="button"
            className="w-full min-h-12 px-3 rounded-xl text-start hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3"
            onClick={() => {
              setMobileNavOpen(false);
              onNavigate("cart");
            }}
          >
            <ShoppingCart className="size-4" /> {t("super.cart")}
            {cartCount > 0 && (
              <span className="ms-auto text-xs bg-blue-600 text-white rounded-full px-2 py-0.5">{cartCount}</span>
            )}
          </button>
          <button
            type="button"
            className="w-full min-h-12 px-3 rounded-xl text-start hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3"
            onClick={() => {
              setMobileNavOpen(false);
              onNavigate("browse");
            }}
          >
            <Heart className="size-4" /> {t("common.favorites")}
          </button>
          <button
            type="button"
            className="w-full min-h-12 px-3 rounded-xl text-start hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-red-600"
            onClick={() => {
              setMobileNavOpen(false);
              onNavigate("auction");
            }}
          >
            <Gavel className="size-4" /> {t("nav.auction")}
          </button>
          {user ? (
            <>
              {user.role === "admin" && (
                <button
                  type="button"
                  className="w-full min-h-12 px-3 rounded-xl text-start bg-blue-600 text-white flex items-center gap-3"
                  onClick={() => {
                    setMobileNavOpen(false);
                    onNavigate("admin");
                  }}
                >
                  <ShieldCheck className="size-4" /> {t("common.adminPanel")}
                </button>
              )}
              <button
                type="button"
                className="w-full min-h-12 px-3 rounded-xl text-start hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3"
                onClick={() => {
                  setMobileNavOpen(false);
                  onLogout();
                  toast.success(tOpt(t, "Signed out"));
                }}
              >
                <LogOut className="size-4" /> {t("common.signOut")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="w-full min-h-12 px-3 rounded-xl text-start hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3"
              onClick={() => {
                setMobileNavOpen(false);
                onNavigate("auth");
              }}
            >
              <UserCog className="size-4" /> {t("common.login")}
            </button>
          )}
          <div className="pt-4">
            <p className="text-xs text-slate-500 mb-2 px-1">{t("super.verticals")}</p>
            <VerticalSwitcher size="sm" className="w-full" />
          </div>
        </div>
      </MobileSheet>

      <HeroSlider onNavigate={onNavigate} />

      <Banners placement="landing-top" className="max-w-7xl mx-auto px-4 pt-4" />

      <section className="max-w-7xl mx-auto px-4 pt-6">
        <p className="text-center text-slate-600 dark:text-slate-300 text-sm mb-3">{t(`super.tagline.${vertical}`)}</p>
        <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3 overflow-x-auto" role="tablist" aria-label={t("common.searchingIn")}>
            <span className="text-slate-500 whitespace-nowrap pe-2">{t("common.searchingIn")}</span>
            {SEARCH_TABS.map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={tab === s}
                onClick={() => selectTab(s)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition ${tab === s ? "bg-[#2563eb] text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
              >
                {s === "all" ? t("common.tabAll") : t(`super.vertical.${s}`)}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              search();
            }}
            className="flex flex-col sm:flex-row sm:items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl p-2"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Search className="size-5 text-slate-400 ms-1 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("common.searchAnything")}
                className="flex-1 min-w-0 outline-none py-2.5 bg-transparent text-base sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto min-h-11 px-6 py-2.5 rounded-lg bg-[#2563eb] text-white hover:bg-[#1d4ed8] shrink-0"
            >
              <Editable id="landing.searchBtn" page="Landing" label="Search Button" defaultValue={t("hero.search")} />
            </button>
          </form>
        </div>
      </section>

      <LiveAuctionsSection onNavigate={onNavigate} category={activeCategory} />

      <section className="max-w-7xl mx-auto px-4 mt-8 mb-12">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h2 className="tracking-tight">
            {t("common.popularCategories")}
            {activeCategory && (
              <span className="ms-2 text-sm font-normal text-blue-600">
                · {t(`super.vertical.${activeCategory}`)}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={() =>
              activeCategory
                ? onNavigate("browse", { category: activeCategory })
                : onNavigate("search")
            }
            className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <Layers className="size-3.5" /> {t("super.searchNav")}
          </button>
        </div>
        {featuredListings.length > 0 && (
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {featuredListings.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onNavigate("detail", { id: String(l.id) })}
                className="text-start rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <ImageWithFallback src={l.img} alt={l.title} className="size-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm">{l.title}</p>
                  <p className="text-blue-600 text-sm mt-1" dir="ltr">{formatCurrency(l.price)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        <div className={`grid gap-x-6 gap-y-8 ${
          visiblePopular.length === 1
            ? "grid-cols-1 max-w-sm"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
        }`}>
          {visiblePopular.map((p) => {
            const highlighted = !activeCategory || p.category === activeCategory;
            return (
            <div
              key={p.id}
              className={highlighted && activeCategory ? "rounded-xl ring-2 ring-blue-500/40 bg-blue-50/40 dark:bg-blue-950/20 p-3 -m-1" : undefined}
            >
              <button
                onClick={() => {
                  selectTab(p.category as LuxuryCategory);
                  onNavigate("browse", { category: p.category });
                }}
                className="flex items-center gap-2 mb-3 text-start hover:text-amber-800 transition"
              >
                <p.icon className="size-5 text-amber-800 shrink-0" />
                <span className="tracking-tight">{t(`super.vertical.${p.id}`, { defaultValue: p.label })}</span>
              </button>
              <ul className="space-y-2">
                {p.items.map((it) => (
                  <li key={it}>
                    <button
                      onClick={() => onNavigate("browse", { category: p.category, q: it })}
                      className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-start flex items-center gap-1"
                    >
                      {it === "Rental Cars" ? (
                        <span className="inline-flex items-center gap-1">
                          {tOpt(t, it)}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white">{t("common.newBadge")}</span>
                        </span>
                      ) : tOpt(t, it)}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => onNavigate("browse", { category: p.category })}
                    className="flex items-center gap-1 text-blue-600 hover:underline text-start"
                  >
                    <span>{t("common.allIn", { label: tOpt(t, p.label) })}</span>
                    <ArrowRight className="size-3.5 shrink-0 rtl:rotate-180" />
                  </button>
                </li>
              </ul>
            </div>
            );
          })}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-10">
          <p className="tracking-tight mb-4">{t("common.recentlyViewed")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {recent.slice(0, 6).map((l) => (
              <button
                key={l.id}
                onClick={() => onNavigate("detail", { id: String(l.id) })}
                className="text-start rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <ImageWithFallback src={l.img} alt={l.title} className="size-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm">{l.title}</p>
                  <p className="text-blue-600 text-sm mt-1">{formatCurrency(l.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <Banners placement="landing-mid" className="max-w-7xl mx-auto px-4 mt-8" />
      <Banners placement="landing-bottom" className="max-w-7xl mx-auto px-4 mt-8" />

      <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <p className="tracking-tight mb-4">
            <Editable id="landing.popularSearchesTitle" page="Landing" label="Popular Searches Title"
              defaultValue={t("common.popularSearches")} />
          </p>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
            {[
              "Used Cars in Dubai", "Apartments for Rent in Dubai Marina", "Villas for Sale in Palm Jumeirah",
              "Toyota Land Cruiser", "iPhone 15 Pro Max", "MacBook Pro M3",
              "Used Cars in Abu Dhabi", "Studio for Rent in JLT", "Range Rover Sport",
              "Mercedes G63", "Furniture in Dubai", "PlayStation 5",
              "BMW M4", "Townhouses in Dubai South", "Honda Civic",
              "Office Space for Rent", "Nissan Patrol", "Apartments for Sale Downtown",
              "Tesla Model Y", "Cameras DSLR", "Porsche 911",
              "Apartments for Rent in JBR", "Audi RS6", "Mountain Bikes",
            ].map((s) => (
              null
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center gap-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex-1">
            <p className="tracking-tight">
              <Editable id="landing.appPromoTitle" page="Landing" label="App Promo Title"
                defaultValue={t("common.appPromoTitle")} />
            </p>
            <p className="text-[#2563eb]">
              <Editable id="landing.appPromoSub" page="Landing" label="App Promo Subtitle"
                defaultValue={t("common.appPromoSub")} />
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => toast(t("common.openingAppStore"))} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white">
              <svg viewBox="0 0 24 24" className="size-7 fill-white" aria-hidden>
                <path d="M16.365 1.43c0 1.14-.46 2.24-1.21 3.04-.81.86-2.13 1.52-3.22 1.43-.13-1.11.42-2.27 1.18-3.05.85-.88 2.27-1.55 3.25-1.42zM20.5 17.5c-.55 1.27-.81 1.83-1.51 2.95-1 1.6-2.41 3.6-4.16 3.62-1.55.02-1.95-1.01-4.06-1-2.11.01-2.55 1.02-4.1 1-1.75-.02-3.08-1.83-4.08-3.43C-.42 18.04-1.06 13.34.34 10.4 1.36 8.27 3.41 6.93 5.34 6.93c1.84 0 3 .96 4.52.96 1.47 0 2.36-.96 4.49-.96 1.7 0 3.5.94 4.79 2.55-4.21 2.31-3.53 8.31 1.36 8.02z"/>
              </svg>
              <span className="text-[10px] leading-tight text-start">{t("common.downloadOnThe")}<br /><span className="text-sm">App Store</span></span>
            </button>
            <button onClick={() => toast(t("common.openingGooglePlay"))} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white">
              <svg viewBox="0 0 512 512" className="size-7" aria-hidden>
                <path fill="#EA4335" d="M325.3 234.3 104.6 13l280.8 161.2-60.1 60.1z"/>
                <path fill="#FBBC04" d="m104.6 13 220.7 221.3-220.7 220.7c-7.6-3.4-12.6-10.7-12.6-19.4V32.4c0-8.7 5-16 12.6-19.4z"/>
                <path fill="#4285F4" d="m385.4 174.2 60.5 34.7c20.7 11.9 20.7 41.7 0 53.6l-60.9 34.9-65.1-60.6 65.5-62.6z"/>
                <path fill="#34A853" d="M104.6 455 325.3 234.3l60.1 60.1L104.6 455z"/>
              </svg>
              <span className="text-[10px] leading-tight text-start">{t("common.getItOn")}<br /><span className="text-sm">Google Play</span></span>
            </button>
            <button onClick={() => toast(t("common.openingAppGallery"))} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white">
              <span className="size-7 rounded-md bg-[#e8333d] flex items-center justify-center text-[9px] tracking-tighter">HUAWEI</span>
              <span className="text-[10px] leading-tight text-start">{t("common.exploreItOn")}<br /><span className="text-sm">AppGallery</span></span>
            </button>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 py-10 hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-slate-600 dark:text-slate-300">
            {[
              { title: "Company", items: ["About Us", "Advertising", "Careers", "Legal Hub", "Sitemap"] },
              { title: "gcc.region", items: ["Madinah", "Riyadh", "Jeddah", "Dubai", "Doha", "Kuwait City", "Manama", "Muscat"] },
              { title: "gcc.allCountries", items: ["Saudi Arabia", "UAE", "Kuwait", "Bahrain", "Qatar", "Oman"] },
              { title: "Get Social", items: ["Facebook", "X", "Youtube", "Instagram"] },
              { title: "Support", items: ["Help", "Contact Us", "Call Us"] },
              { title: "Languages", items: ["English", "العربية"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-slate-900 dark:text-slate-100 mb-3">
                  {col.title.includes(".") ? t(col.title) : tOpt(t, col.title)}
                </p>
                <ul className="space-y-2">
                  {col.items.map((it) => (
                    <li key={it}>
                      <button onClick={() => toast(tOpt(t, it))} className="hover:text-blue-600">{tOpt(t, it)}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
              <span className="tracking-tight text-xl bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{t("brand")}</span>
              <p className="text-slate-500">© 2026 {t("brand")}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
