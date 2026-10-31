import { requireAdmin } from "@/lib/data/auth";
import { getRallyCompetition, listRallyLog, listRallyPostOptions } from "@/lib/data/rally";
import { localePath } from "@/lib/i18n/config";
import { rallyFiltersSchema } from "@/lib/validations/rally";
import { RallyFiltersForm } from "@/features/rally/components/rally-filters-form";
import { RallyLogTable } from "@/features/rally/components/rally-log-table";
import type { RallyListSectionProps } from "@/types/rally";

export async function RallyLogSection({ lang, searchParams }: RallyListSectionProps) {
  await requireAdmin();
  const raw = await searchParams;
  const filters = rallyFiltersSchema.parse({ q: typeof raw.q === "string" ? raw.q : "", post: raw.post, team: raw.team, page: raw.page });
  const competition = await getRallyCompetition();
  const [posts, list] = await Promise.all([competition ? listRallyPostOptions(competition.id) : [], listRallyLog(filters)]);

  return (
    <div className="space-y-4">
      <RallyFiltersForm filters={filters} posts={posts} resetHref={localePath(lang, "/admin/rally/log")} />
      <RallyLogTable list={list} filters={filters} lang={lang} />
    </div>
  );
}
