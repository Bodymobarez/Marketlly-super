import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { tOpt } from "../i18nLabel";

const cats: { id: string; label: string; sub: { col1: string[]; col2: string[] } }[] = [
  {
    id: "electronics",
    label: "Electronics",
    sub: {
      col1: [
        "Home Audio & Turntables",
        "Televisions",
        "DVD & Home Theater",
        "Electronic Accessories",
        "Gadgets",
        "Car Electronics",
        "Projectors",
        "Mp3 Players and Portable Audio",
        "Satellite & Cable TV",
        "Health Electronics",
        "Smart Home",
      ],
      col2: ["Wearable Technology", "Other"],
    },
  },
  {
    id: "computers",
    label: "Computers & Networking",
    sub: {
      col1: ["Laptops", "Desktops", "Networking", "Components", "Software"],
      col2: ["Printers", "Storage", "Other"],
    },
  },
  {
    id: "mobiles",
    label: "Mobile Phones & Tablets",
    sub: {
      col1: ["Mobile Phones", "Tablets", "Mobile Phone & Tablet Accessories", "Smartwatches"],
      col2: ["iPhone", "Samsung", "Other Mobile Phones & Tablets", "Other"],
    },
  },
];

type Props = {
  onPick: (params: Record<string, string>) => void;
  onClose: () => void;
  variant?: "dropdown" | "sheet";
};

export function ClassifiedsMenu({ onPick, onClose, variant = "dropdown" }: Props) {
  const { t } = useTranslation();
  const [active, setActive] = useState("electronics");
  const current = cats.find((c) => c.id === active) || cats[0];
  const choose = (q?: string) => {
    onPick({ category: "classifieds", q: q || "" });
    onClose();
  };

  const left = (
    <div
      className={
        variant === "sheet"
          ? ""
          : "w-72 p-3 border-e border-slate-200 dark:border-slate-800 max-h-[480px] overflow-y-auto"
      }
    >
      <ul className="space-y-1">
        {cats.map((it) => (
          <li key={it.id}>
            <button
              type="button"
              onMouseEnter={() => variant === "dropdown" && setActive(it.id)}
              onClick={() => {
                setActive(it.id);
                if (variant === "dropdown") choose();
              }}
              className={`w-full flex items-center justify-between min-h-11 px-3 py-2 rounded-xl text-start ${
                active === it.id
                  ? "bg-[#dbeafe] dark:bg-slate-800 text-[#2563eb]"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span>{tOpt(t, it.label)}</span>
              <ChevronRight className="size-4 text-slate-400 rtl:rotate-180" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const right = (
    <div className={variant === "sheet" ? "pt-3 border-t border-slate-100 dark:border-slate-800" : "flex-1 p-5"}>
      <div className="flex items-center justify-between mb-3">
        <p className="tracking-tight font-medium">{tOpt(t, current.label)}</p>
        <button type="button" onClick={() => choose()} className="text-[#2563eb] hover:underline text-sm">
          {t("menu.viewAll")}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        <ul className="space-y-1">
          {current.sub.col1.map((b) => (
            <li key={b}>
              <button
                type="button"
                onClick={() => choose(b)}
                className="w-full text-start min-h-10 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {tOpt(t, b)}
              </button>
            </li>
          ))}
        </ul>
        <ul className="space-y-1">
          {current.sub.col2.map((b) => (
            <li key={b}>
              <button
                type="button"
                onClick={() => choose(b)}
                className="w-full text-start min-h-10 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
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
        {left}
        {right}
      </div>
    );
  }

  return (
    <div
      className="absolute top-full start-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-b-xl shadow-2xl flex max-w-[min(760px,100vw)]"
      onMouseLeave={onClose}
    >
      {left}
      {right}
    </div>
  );
}
