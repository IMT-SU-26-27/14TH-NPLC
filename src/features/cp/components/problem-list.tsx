import Link from "next/link";
import { CircleCheckIcon, CircleDashedIcon, FileCodeIcon } from "lucide-react";
import { localePath } from "@/lib/i18n/config";
import { formatScore } from "@/lib/format";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import type { ProblemListProps } from "@/types/cp";

export function ProblemList({ problems, lang }: ProblemListProps) {
  const t = getT(lang);

  if (problems.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileCodeIcon />
          </EmptyMedia>
          <EmptyTitle>{t("cp.noProblems")}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ItemGroup className="gap-2">
      {problems.map((p) => (
        <Item key={p.id} variant="outline" className="bg-card" render={<Link href={localePath(lang, `/cp/problems/${p.id}`)} />}>
          <ItemMedia variant="icon">
            {p.solved ? <CircleCheckIcon className="text-success" /> : <CircleDashedIcon className="text-muted-foreground" />}
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              {t("cp.level", { level: p.level })} · {p.title}
            </ItemTitle>
            <ItemDescription>
              {p.bestScore === null ? t("cp.notTried") : t("cp.best", { score: formatScore(p.bestScore, lang) })}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            {p.solved && <Badge className="bg-success text-success-foreground">{t("cp.solved")}</Badge>}
            <Badge variant="secondary">{t("cp.points", { points: p.points })}</Badge>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  );
}
