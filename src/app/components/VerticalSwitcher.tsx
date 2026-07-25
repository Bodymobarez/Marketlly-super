import { Crown, Ship, Anchor, Home, Landmark, Mountain, Car } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VERTICAL_ORDER, type ShoppingVertical } from "@marketly/core";
import { useApp } from "../AppContext";

const icons: Record<ShoppingVertical, typeof Crown> = {
  super: Crown,
  boats: Ship,
  yachts: Anchor,
  villas: Home,
  palaces: Landmark,
  chalets: Mountain,
  cars: Car,
};

type Props = {
  className?: string;
  size?: "sm" | "md";
};

export function VerticalSwitcher({ className = "", size = "md" }: Props) {
  const { t } = useTranslation();
  const { vertical, setVertical } = useApp();
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <div
      className={`inline-flex max-w-full items-center overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/80 p-0.5 ${className}`}
      role="tablist"
      aria-label={t("super.verticals")}
    >
      {VERTICAL_ORDER.map((id) => {
        const Icon = icons[id];
        const active = vertical === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setVertical(id)}
            className={`${pad} shrink-0 rounded-lg inline-flex items-center gap-1.5 font-medium transition ${
              active
                ? "bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Icon className={size === "sm" ? "size-3.5" : "size-4"} />
            {t(`super.vertical.${id}`)}
          </button>
        );
      })}
    </div>
  );
}
