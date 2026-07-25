import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ProductDetail } from "../../app/components/ProductDetail";

export function ProductPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { ref } = useParams();
  const productRef = ref || "";
  if (!productRef) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button type="button" onClick={() => navigate("/search")} className="text-blue-600">
          {t("super.back")}
        </button>
      </div>
    );
  }
  return (
    <ProductDetail
      productRef={productRef}
      onBack={() => navigate("/search")}
      onOpenCart={() => navigate("/cart")}
    />
  );
}
