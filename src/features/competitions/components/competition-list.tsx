import { cacheLife, cacheTag } from "next/cache";
import { TrophyIcon } from "lucide-react";
import { COMPETITIONS_TAG, getActiveCompetitions, getCompetitionTeamCounts, isQuotaFull } from "@/lib/data/competitions";
import { getT } from "@/lib/i18n/get-dictionary";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { CompetitionCard } from "@/features/competitions/components/competition-card";
import type { LangProps } from "@/types/i18n";

// Cached per language with the competitions, so open/closed badges refresh at most every few minutes.
export async function CompetitionList({ lang }: LangProps) {
  "use cache";
  cacheLife("minutes");
  cacheTag(COMPETITIONS_TAG);

  const t = getT(lang);
  const [competitions, counts] = await Promise.all([getActiveCompetitions(), getCompetitionTeamCounts()]);

  if (competitions.length === 0) {
    return (
      <Empty className="bg-card border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TrophyIcon />
          </EmptyMedia>
          <EmptyTitle>{t("competition.emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("competition.emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {competitions.map((competition, i) => (
        <CompetitionCard key={competition.id} competition={competition} lang={lang} index={i} full={isQuotaFull(competition, counts)} />
      ))}
    </div>
  );
}
