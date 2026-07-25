import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { AuctionList } from "../../app/components/AuctionList";
import { useAuth } from "../../app/AuthContext";
import { Gavel } from "lucide-react";
import { tOpt } from "../../app/i18nLabel";

export function AuctionListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, can } = useAuth();
  const allowed = !user || user.role === "admin" || can("canBrowseAuctions");

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="text-center max-w-md">
          <Gavel className="size-12 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold mb-2">{tOpt(t, "Auctions access is disabled")}</p>
          <p className="text-sm text-slate-500 mb-4">
            {tOpt(t, "An admin must turn on the “Auctions” permission for your account before you can browse auctions.")}
          </p>
          <button onClick={() => navigate("/")} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
            {tOpt(t, "Back to home")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuctionList
      onBack={() => navigate("/")}
      onOpen={(id) => navigate(`/auctions/${id}`)}
    />
  );
}
