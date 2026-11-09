import { InfoIcon } from "lucide-react";
import { getT } from "@/lib/i18n/get-dictionary";
import { DashboardNote } from "@/features/dashboard/components/dashboard-note";
import type { AccountNoteProps } from "@/types/registration";

// One account, one team: shown once the account is on a team.
export function AccountNote({ teamName, lang }: AccountNoteProps) {
  const t = getT(lang);
  return <DashboardNote icon={InfoIcon} title={t("dashboard.oneAccountTitle")} description={t("dashboard.oneAccountDescription", { team: teamName })} />;
}
