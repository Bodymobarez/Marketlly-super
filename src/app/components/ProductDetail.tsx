import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, ShoppingCart, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { superGetByRef, type AggregatedProduct } from "@marketly/core";
import { useApp } from "../AppContext";
import { HeaderControls } from "./HeaderControls";
import { SourceBadge } from "./SourceBadge";
import { formatCurrency } from "../utils";
import { toast } from "sonner";

type Props = {
  productRef: string;
  onBack: () => void;
  onOpenCart: () => void;
};

export function ProductDetail({ productRef, onBack, onOpenCart }: Props) {
  const { t } = useTranslation();
  const { addCartLine, cartCount, currency } = useApp();
  void currency;
  const [product, setProduct] = useState<AggregatedProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    superGetByRef(decodeURIComponent(productRef)).then((p) => {
      if (!alive) return;
      setProduct(p);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [productRef]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 gap-2">
        <Loader2 className="size-5 animate-spin" /> {t("super.loading")}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-slate-600">{t("super.productNotFound")}</p>
        <button type="button" onClick={onBack} className="px-4 py-2 rounded-lg bg-blue-600 text-white">
          {t("super.back")}
        </button>
      </div>
    );
  }

  const add = () => {
    if (!product.inStock) {
      toast.error(t("super.outOfStock"));
      return;
    }
    addCartLine({
      ref: product.ref,
      providerId: product.providerId,
      providerName: product.providerName,
      externalId: product.externalId,
      listingId: product.listingId,
      title: product.title,
      price: product.price,
      image: product.image,
      vertical: product.vertical,
    });
    toast.success(t("super.addedToCart"));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-3">
          <button type="button" onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </button>
          <span className="tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent font-semibold">
            {t("brand")}
          </span>
          <div className="ms-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <ShoppingCart className="size-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -end-1 size-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <HeaderControls />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 aspect-square">
          <img src={product.image} alt={product.title} className="size-full object-cover" />
          <div className="absolute top-3 start-3">
            <SourceBadge name={product.providerName} />
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-slate-500 capitalize">
            {t(`super.vertical.${product.vertical}`)} · {product.category}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{product.title}</h1>
          <p className="text-3xl font-bold text-blue-600" dir="ltr">
            {formatCurrency(product.price)}
          </p>
          <p className="text-slate-500 inline-flex items-center gap-1">
            <MapPin className="size-4" /> {product.location}
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{product.description}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
              {t("super.source")}: {product.providerName}
            </span>
            {product.brand && (
              <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">{product.brand}</span>
            )}
            {!product.inStock && (
              <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-700">{t("super.outOfStock")}</span>
            )}
          </div>
          <button
            type="button"
            onClick={add}
            disabled={!product.inStock}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-40 hover:bg-blue-700"
          >
            {t("super.addToCart")}
          </button>
        </div>
      </div>
    </div>
  );
}
