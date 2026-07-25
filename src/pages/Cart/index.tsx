import { useNavigate } from "react-router";
import { Cart } from "../../app/components/Cart";

export function CartPage() {
  const navigate = useNavigate();
  return (
    <Cart
      onBack={() => navigate(-1)}
      onContinueShopping={() => navigate("/search")}
    />
  );
}
