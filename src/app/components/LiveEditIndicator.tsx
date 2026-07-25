import { Pencil, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useElements } from "../ElementsContext";

export function LiveEditIndicator() {
  const { t } = useTranslation();
  const { isAdmin, editMode, setEditMode, registry } = useElements();
  if (!isAdmin || !editMode) return null;

  const count = Object.keys(registry).length;

  return (
    <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-4 end-4 z-[100] flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-2xl animate-pulse-slow">
      <Pencil className="size-4" />
      <span className="text-sm hidden sm:inline">{t("liveEdit.on", { count })}</span>
      <span className="text-sm sm:hidden">{t("liveEdit.short", { count })}</span>
      <button
        onClick={() => setEditMode(false)}
        className="ms-1 size-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
        title={t("liveEdit.exit")}
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
