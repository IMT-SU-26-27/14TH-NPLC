"use client";

import { useI18n } from "@/hooks/use-i18n";
import { formatDateTime } from "@/lib/format";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import { LoOutcomeBadge } from "@/features/rally/components/lo-outcome-badge";
import type { LoRecentResultsProps } from "@/types/rally";

export function LoRecentResults({ results }: LoRecentResultsProps) {
  const { t, lang } = useI18n();
  if (results.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-heading font-semibold">{t("rally.lo.recentTitle")}</h2>
      <ItemGroup className="gap-2">
        {results.map((result) => (
          <Item key={result.result_id} variant="outline" size="sm" className="bg-card">
            <ItemContent>
              <ItemTitle>{result.team_name}</ItemTitle>
              <ItemDescription>{formatDateTime(result.recorded_at, lang)}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <LoOutcomeBadge outcome={result.outcome} points={result.points} />
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </section>
  );
}
