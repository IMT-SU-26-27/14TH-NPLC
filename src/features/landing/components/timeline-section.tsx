import { cacheLife, cacheTag } from "next/cache";
import { CalendarIcon } from "lucide-react";
import { CONTENT_TAG, getTimelineEvents } from "@/lib/data/content";
import { formatDateRange } from "@/lib/format";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import type { TimelineSectionProps } from "@/types/content";

export async function TimelineSection({ lang }: TimelineSectionProps) {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  const t = getT(lang);
  const events = await getTimelineEvents();

  if (events.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarIcon />
          </EmptyMedia>
          <EmptyTitle>{t("landing.timelineEmpty")}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ItemGroup className="gap-3">
        {events.map((event) => {
          const description = lang === "id" ? event.description_id : event.description_en;
          return (
              <Item key={event.id} variant="outline" className="bg-card items-start">
                <ItemMedia variant="icon">
                  <CalendarIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{lang === "id" ? event.title_id : event.title_en}</ItemTitle>
                  {description && <ItemDescription className="line-clamp-none">{description}</ItemDescription>}
                </ItemContent>
                <Badge variant="secondary" className="shrink-0">
                  {formatDateRange(event.starts_on, event.ends_on, lang)}
                </Badge>
              </Item>
          );
        })}
    </ItemGroup>
  );
}
