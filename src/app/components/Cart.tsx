import { ArrowLeft, Minus, Plus, Trash2, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cartApi } from "@marketly/core";
import { useApp } from "../AppContext";
import { HeaderControls } from "./HeaderControls";
import { SourceBadge } from "./SourceBadge";
import { formatCurrency } from "../utils";
import { toast } from "sonner";

type Props = {
  onBack: () => void;
  onContinueShopping: () => void;
};

export function Cart({ onBack, onContinueShopping }: Props) {
  const { t } = useTranslation();
  const { cart, setCartQty, clearCart, currency } = useApp();
  const groups = cartApi.groupCartBySeller(cart);
  const total = cart.lines.reduce((n, l) => n + l.price * l.quantity, 0);
  void currency; // cart totals reformat when GCC country/currency changes

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <button type="button" onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </button>
          <div>
            <p className="font-semibold">{t("super.cart")}</p>
            <p className="text-xs text-slate-500">{t("super.cartSub")}</p>
          </div>
          <div className="ms-auto">
            <HeaderControls />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {cart.lines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center space-y-3">
            <p className="text-slate-500">{t("super.cartEmpty")}</p>
            <button
              type="button"
              onClick={onContinueShopping}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white"
            >
              {t("super.continueShopping")}
            </button>
          </div>
        ) : (
          <>
            {Object.entries(groups).map(([providerId, lines]) => (
              <section
                key={providerId}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Store className="size-4 text-slate-400" />
                  <span className="font-medium text-sm">{lines[0]?.providerName}</span>
                  <SourceBadge name={providerId} className="ms-auto !static" />
                </div>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {lines.map((line) => (
                    <li key={line.ref} className="p-4 flex gap-3">
                      <img
                        src={line.image}
                        alt=""
                        className="size-16 rounded-lg object-cover bg-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{line.title}</p>
                        <p className="text-blue-600 font-semibold text-sm" dir="ltr">
                          {formatCurrency(line.price)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            className="size-7 rounded-md border border-slate-200 dark:border-slate-700 flex items-center justify-center"
                            onClick={() => setCartQty(line.ref, line.quantity - 1)}
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="text-sm w-6 text-center" dir="ltr">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            className="size-7 rounded-md border border-slate-200 dark:border-slate-700 flex items-center justify-center"
                            onClick={() => setCartQty(line.ref, line.quantity + 1)}
                          >
                            <Plus className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            className="ms-auto p-1.5 text-rose-600"
                            onClick={() => setCartQty(line.ref, 0)}
                            aria-label={t("super.remove")}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
              <div className="flex items-center justify-between font-semibold">
                <span>{t("super.subtotal")}</span>
                <span dir="ltr">{formatCurrency(total)}</span>
              </div>
              <p className="text-xs text-slate-500">{t("super.splitHint")}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toast.success(t("super.checkoutDemo"));
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium"
                >
                  {t("super.checkout")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    toast(t("super.cartCleared"));
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  {t("super.clearCart")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
