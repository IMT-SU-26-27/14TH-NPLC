import { requireAdmin } from "@/lib/data/auth";
import { getTeamCounts, listCompetitions } from "@/lib/data/admin";
import { CompetitionsTable } from "@/features/admin/components/competitions-table";
import type { LangProps } from "@/types/i18n";

export async function CompetitionsSection({ lang }: LangProps) {
  await requireAdmin();
  const [competitions, teamCounts] = await Promise.all([listCompetitions(), getTeamCounts()]);
  return <CompetitionsTable competitions={competitions} teamCounts={teamCounts} lang={lang} />;
}
