import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Detail } from "../../app/components/Detail";
import { tOpt } from "../../app/i18nLabel";

export function DetailPage({ id }: { id: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  if (!id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-slate-600">{t("detail.notFound")}</p>
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={() => navigate("/browse")}>
          {tOpt(t, "Back to browse")}
        </button>
      </div>
    );
  }
  return (
    <Detail
      id={id}
      onBack={() => navigate("/browse")}
      onOpen={(next) => navigate(`/listing/${next}`)}
    />
  );
}
