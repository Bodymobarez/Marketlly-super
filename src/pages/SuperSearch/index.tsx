import { useNavigate, useSearchParams } from "react-router";
import { DEFAULT_GCC_CITY_LABEL, DEFAULT_GCC_COUNTRY } from "@marketly/core";
import { SuperSearch } from "../../app/components/SuperSearch";

export function SuperSearchPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  return (
    <SuperSearch
      initialQ={sp.get("q") || ""}
      initialLocation={sp.get("location") || DEFAULT_GCC_CITY_LABEL}
      initialCountry={sp.get("country") || DEFAULT_GCC_COUNTRY}
      onBack={() => navigate("/")}
      onOpenProduct={(ref) => navigate(`/product/${encodeURIComponent(ref)}`)}
      onOpenListing={(id) => navigate(`/listing/${id}`)}
      onOpenCart={() => navigate("/cart")}
    />
  );
}
