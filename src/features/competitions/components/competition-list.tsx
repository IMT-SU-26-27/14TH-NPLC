import { cacheLife, cacheTag } from "next/cache";
import { TrophyIcon } from "lucide-react";
import { COMPETITIONS_TAG, getActiveCompetitions } from "@/lib/data/competitions";
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
  const competitions = await getActiveCompetitions();

  if (competitions.length === 0) {
    return (
      <Empty className="border">
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
      {competitions.map((competition) => (
        <CompetitionCard key={competition.id} competition={competition} lang={lang} />
      ))}
    </div>
  );
}
