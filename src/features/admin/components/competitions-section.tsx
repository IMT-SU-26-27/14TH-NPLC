import { requireAdmin } from "@/lib/data/auth";
import { listCompetitions } from "@/lib/data/admin";
import { CompetitionsTable } from "@/features/admin/components/competitions-table";
import type { LangProps } from "@/types/i18n";

export async function CompetitionsSection({ lang }: LangProps) {
  await requireAdmin();
  const competitions = await listCompetitions();
  return <CompetitionsTable competitions={competitions} lang={lang} />;
}
