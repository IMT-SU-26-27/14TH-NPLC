import { cacheLife, cacheTag } from "next/cache";
import { TrophyIcon } from "lucide-react";
import { COMPETITIONS_TAG, getActiveCompetitions } from "@/lib/data/competitions";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { CompetitionCard } from "@/features/competitions/components/competition-card";

// Cached with the competitions, so the open/closed badges refresh at most every few minutes.
export async function CompetitionList() {
  "use cache";
  cacheLife("minutes");
  cacheTag(COMPETITIONS_TAG);

  const competitions = await getActiveCompetitions();

  if (competitions.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TrophyIcon />
          </EmptyMedia>
          <EmptyTitle>No competitions yet</EmptyTitle>
          <EmptyDescription>Check back soon. Competitions appear here once registration is announced.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {competitions.map((competition) => (
        <CompetitionCard key={competition.id} competition={competition} />
      ))}
    </div>
  );
}
