import { CircleOffIcon } from "lucide-react";
import { requireAdmin } from "@/lib/data/auth";
import { getRallyCompetition, listLoAccounts, listRallyPosts } from "@/lib/data/rally";
import { getT } from "@/lib/i18n/get-dictionary";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { LoAccountsCard } from "@/features/rally/components/lo-accounts-card";
import { RallyPostsTable } from "@/features/rally/components/rally-posts-table";
import type { LangProps } from "@/types/i18n";

export async function RallyAdminSection({ lang }: LangProps) {
  const t = getT(lang);
  await requireAdmin();
  const competition = await getRallyCompetition();

  if (!competition) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleOffIcon />
          </EmptyMedia>
          <EmptyTitle>{t("rally.admin.noCompetitionTitle")}</EmptyTitle>
          <EmptyDescription>{t("rally.admin.noCompetitionDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const [posts, accounts] = await Promise.all([listRallyPosts(competition.id), listLoAccounts()]);

  return (
    <div className="space-y-6">
      <RallyPostsTable posts={posts} lang={lang} />
      <LoAccountsCard accounts={accounts} lang={lang} />
    </div>
  );
}
