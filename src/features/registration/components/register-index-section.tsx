import { redirect } from "next/navigation";
import { TriangleAlertIcon } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { hasRegistration } from "@/lib/data/registrations";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CompetitionList } from "@/features/competitions/components/competition-list";
import type { LangProps } from "@/types/i18n";

export async function RegisterIndexSection({ lang }: LangProps) {
  const t = getT(lang);
  const user = await requireUser("/register");
  if (await hasRegistration(user.id)) redirect(`${localePath(lang, "/dashboard")}?notice=already-registered`);

  return (
    <div className="space-y-6">
      <Alert>
        <TriangleAlertIcon />
        <AlertDescription>{t("register.oneCompetitionWarning")}</AlertDescription>
      </Alert>
      <CompetitionList lang={lang} />
    </div>
  );
}
