import { NavLink, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { Gavel, Home, Search, ShoppingCart, User } from "lucide-react";
import { useApp } from "../AppContext";

const HIDDEN_PREFIXES = ["/admin", "/preview"];

type TabId = "home" | "explore" | "auctions" | "cart" | "account";

const TABS: {
  id: TabId;
  to: string;
  icon: typeof Home;
  labelKey: string;
  match: (path: string) => boolean;
  accent?: "auction";
}[] = [
  {
    id: "home",
    to: "/",
    icon: Home,
    labelKey: "tabs.home",
    match: (p) => p === "/",
  },
  {
    id: "explore",
    to: "/search",
    icon: Search,
    labelKey: "tabs.explore",
    match: (p) =>
      p.startsWith("/browse") ||
      p.startsWith("/search") ||
      p.startsWith("/listing") ||
      p.startsWith("/product"),
  },
  {
    id: "auctions",
    to: "/auctions",
    icon: Gavel,
    labelKey: "tabs.auctions",
    match: (p) => p.startsWith("/auctions"),
    accent: "auction",
  },
  {
    id: "cart",
    to: "/cart",
    icon: ShoppingCart,
    labelKey: "tabs.cart",
    match: (p) => p.startsWith("/cart"),
  },
  {
    id: "account",
    to: "/auth",
    icon: User,
    labelKey: "tabs.account",
    match: (p) => p.startsWith("/auth") || p.startsWith("/post"),
  },
];

export function shouldShowMobileTabs(pathname: string) {
  return !HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Bottom safe-area height for content padding when tabs are visible (mobile only). */
export const MOBILE_TAB_PAD =
  "pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0";

export function MobileBottomNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { cartCount } = useApp();

  if (!shouldShowMobileTabs(pathname)) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 md:hidden"
      aria-label={t("tabs.aria")}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className="border-t border-slate-200/80 dark:border-slate-800/90 bg-white/92 dark:bg-slate-950/92 backdrop-blur-xl shadow-[0_-10px_40px_rgba(15,23,42,0.08)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.45)]"
        style={{ backdropFilter: "blur(20px) saturate(160%)" }}
      >
        <ul className="flex items-stretch justify-around px-1 pt-1 pb-1">
          {TABS.map((tab) => {
            const active = tab.match(pathname);
            const Icon = tab.icon;
            const isAuction = tab.accent === "auction";
            const activeColor = isAuction
              ? "text-red-600 dark:text-red-400"
              : "text-[#2563eb]";
            const inactiveColor = "text-slate-400 dark:text-slate-500";

            return (
              <li key={tab.id} className="flex-1 min-w-0">
                <NavLink
                  to={tab.to}
                  end={tab.id === "home"}
                  className={`relative flex flex-col items-center justify-center gap-0.5 min-h-11 px-1 py-1.5 rounded-xl transition-colors active:bg-slate-100/80 dark:active:bg-slate-800/60 ${
                    active ? activeColor : inactiveColor
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <span
                      className={`absolute top-0 inset-x-3 h-0.5 rounded-full ${
                        isAuction ? "bg-red-600" : "bg-[#2563eb]"
                      }`}
                      aria-hidden
                    />
                  )}
                  <span className="relative inline-flex items-center justify-center size-6">
                    <Icon
                      className="size-[22px]"
                      strokeWidth={active ? 2.25 : 1.75}
                      fill={active && tab.id !== "auctions" ? "currentColor" : "none"}
                      fillOpacity={active && tab.id !== "auctions" ? 0.15 : 0}
                    />
                    {tab.id === "cart" && cartCount > 0 && (
                      <span className="absolute -top-1 -end-2 min-w-[16px] h-4 px-1 rounded-full bg-[#2563eb] text-white text-[9px] font-bold leading-4 text-center tabular-nums">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                    {isAuction && active && (
                      <span className="absolute -top-0.5 -end-0.5 size-1.5 rounded-full bg-red-600 animate-pulse" aria-hidden />
                    )}
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] leading-tight truncate max-w-full tracking-wide ${
                      active ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {t(tab.labelKey)}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
