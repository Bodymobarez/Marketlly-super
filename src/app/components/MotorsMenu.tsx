import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { tOpt } from "../i18nLabel";

const leftItems = [
  { id: "used", label: "Used Cars" },
  { id: "new", label: "New Cars" },
  { id: "export", label: "Export Cars" },
  { id: "rental", label: "Rental Cars", badge: "NEW" },
  { id: "moto", label: "Motorcycles" },
  { id: "parts", label: "Auto Accessories & Parts" },
  { id: "heavy", label: "Heavy Vehicles" },
  { id: "boats", label: "Boats" },
  { id: "plates", label: "Number Plates" },
];

const brandsByCat: Record<string, { col1: string[]; col2: string[] }> = {
  used: {
    col1: ["Toyota", "Mercedes-Benz", "BMW", "Nissan", "Hyundai", "Porsche", "Ford", "Audi", "Kia", "Land Rover", "Jeep", "Chevrolet", "Mitsubishi", "Honda", "Volkswagen"],
    col2: ["Jetour", "Dodge", "Rolls-Royce", "Bentley"],
  },
  new: { col1: ["Toyota", "BMW", "Mercedes-Benz", "Audi", "Lexus"], col2: ["Tesla", "Genesis", "Porsche"] },
  export: { col1: ["Toyota", "Nissan", "Lexus"], col2: ["Hyundai"] },
  rental: { col1: ["Daily", "Weekly", "Monthly"], col2: ["Long Term"] },
  moto: { col1: ["Harley-Davidson", "Ducati", "Yamaha"], col2: ["Honda", "BMW"] },
  parts: { col1: ["Tires", "Rims", "Audio"], col2: ["Lights", "Filters"] },
  heavy: { col1: ["Trucks", "Buses"], col2: ["Trailers", "Equipment"] },
  boats: { col1: ["Yachts", "Jet Skis"], col2: ["Speedboats"] },
  plates: { col1: ["Dubai", "Abu Dhabi"], col2: ["Sharjah"] },
};

const services = [
  { id: "inspect", label: "Car Inspection" },
  { id: "finance", label: "Car Finance" },
  { id: "eval", label: "Car Evaluation" },
];

type Props = {
  onPick: (params: Record<string, string>) => void;
  onClose: () => void;
  /** sheet = stacked mobile layout; dropdown = desktop mega-menu */
  variant?: "dropdown" | "sheet";
};

export function MotorsMenu({ onPick, onClose, variant = "dropdown" }: Props) {
  const { t } = useTranslation();
  const [active, setActive] = useState("used");
  const data = brandsByCat[active];
  const activeLabel = leftItems.find((i) => i.id === active)?.label || "";

  const choose = (brand?: string) => {
    onPick({ category: "motors", q: brand || "" });
    onClose();
  };

  const leftCol = (
    <div className={variant === "sheet" ? "pb-2" : "w-64 p-3 border-e border-slate-200 dark:border-slate-800"}>
      <ul className="space-y-1">
        {leftItems.map((it) => (
          <li key={it.id}>
            <button
              type="button"
              onMouseEnter={() => variant === "dropdown" && setActive(it.id)}
              onClick={() => {
                setActive(it.id);
                if (variant === "dropdown") choose();
              }}
              className={`w-full flex items-center justify-between min-h-11 px-3 py-2 rounded-xl text-start transition ${
                active === it.id
                  ? "bg-[#dbeafe] dark:bg-slate-800 text-[#2563eb]"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                {tOpt(t, it.label)}
                {it.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2563eb] text-white">
                    {t("common.newBadge")}
                  </span>
                )}
              </span>
              <ChevronRight className="size-4 text-slate-400 rtl:rotate-180 shrink-0" />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => choose()}
        className="mt-3 w-full min-h-11 px-3 py-2 rounded-xl bg-[#dbeafe] dark:bg-slate-800 text-[#2563eb] hover:bg-[#bfdbfe]"
      >
        {t("menu.sellMyCar")}
      </button>

      <p className="mt-4 px-3 text-slate-500 text-sm">{t("menu.services")}</p>
      <ul className="mt-2 space-y-1">
        {services.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => {
                onPick({ service: s.id });
                onClose();
              }}
              className="w-full text-start min-h-11 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              {tOpt(t, s.label)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const brands = (
    <div className={variant === "sheet" ? "pt-3 border-t border-slate-100 dark:border-slate-800" : "flex-1 p-5"}>
      <div className="flex items-center justify-between mb-3 gap-2">
        <p className="tracking-tight font-medium">{tOpt(t, activeLabel)}</p>
        <button type="button" onClick={() => choose()} className="text-[#2563eb] hover:underline text-sm shrink-0">
          {t("menu.viewAll")}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <ul className="space-y-1">
          {data.col1.map((b) => (
            <li key={b}>
              <button
                type="button"
                onClick={() => choose(b)}
                className="w-full text-start min-h-10 px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#2563eb]"
              >
                {tOpt(t, b)}
              </button>
            </li>
          ))}
        </ul>
        <ul className="space-y-1">
          {data.col2.map((b) => (
            <li key={b}>
              <button
                type="button"
                onClick={() => choose(b)}
                className="w-full text-start min-h-10 px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#2563eb]"
              >
                {tOpt(t, b)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  if (variant === "sheet") {
    return (
      <div className="space-y-2 pb-4">
        {leftCol}
        {brands}
      </div>
    );
  }

  return (
    <div
      className="absolute top-full start-0 mt-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-b-xl shadow-2xl flex max-w-[min(720px,100vw)]"
      onMouseLeave={onClose}
    >
      {leftCol}
      {brands}
    </div>
  );
}
