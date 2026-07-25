import { useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** full = nearly full screen; bottom = half sheet */
  size?: "full" | "bottom";
};

/** Touch-friendly modal / bottom sheet for mobile dropdowns & menus */
export function MobileSheet({ open, onClose, title, children, size = "bottom" }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] md:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label={t("common.close")}
        onClick={onClose}
      />
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col bg-white dark:bg-slate-950 rounded-t-2xl shadow-2xl border-t border-slate-200 dark:border-slate-800 ${
          size === "full" ? "max-h-[92dvh]" : "max-h-[78dvh]"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex justify-center pt-2 pb-1 shrink-0" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="flex items-center justify-between gap-3 px-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-base font-semibold tracking-tight truncate">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={t("common.close")}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3">{children}</div>
      </div>
    </div>
  );
}
