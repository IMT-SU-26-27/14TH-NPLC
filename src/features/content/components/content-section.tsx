import { CalendarIcon } from "lucide-react";
import { requireAdmin } from "@/lib/data/auth";
import { getSiteContent, getTimelineEvents } from "@/lib/data/content";
import { formatDateRange } from "@/lib/format";
import { getT } from "@/lib/i18n/get-dictionary";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AboutForm } from "@/features/content/components/about-form";
import { TimelineEventDialog } from "@/features/content/components/timeline-event-dialog";
import { DeleteTimelineEventButton } from "@/features/content/components/delete-timeline-event-button";
import type { LangProps } from "@/types/i18n";

export async function ContentSection({ lang }: LangProps) {
  const t = getT(lang);
  await requireAdmin();
  const [content, events] = await Promise.all([getSiteContent(), getTimelineEvents()]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.content.about")}</CardTitle>
          <CardDescription>{t("admin.content.aboutLead")}</CardDescription>
        </CardHeader>
        <CardContent>
          {content && <AboutForm content={content} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.content.timeline")}</CardTitle>
          <CardDescription>{t("admin.content.timelineLead")}</CardDescription>
          <CardAction>
            <TimelineEventDialog event={null} />
          </CardAction>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarIcon />
                </EmptyMedia>
                <EmptyTitle>{t("admin.content.emptyTitle")}</EmptyTitle>
                <EmptyDescription>{t("admin.content.emptyDescription")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.content.date")}</TableHead>
                    <TableHead>{t("admin.content.titleId")}</TableHead>
                    <TableHead>{t("admin.content.titleEn")}</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="whitespace-nowrap">{formatDateRange(event.starts_on, event.ends_on, lang)}</TableCell>
                      <TableCell className="font-medium">{event.title_id}</TableCell>
                      <TableCell>{event.title_en}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <TimelineEventDialog event={event} />
                          <DeleteTimelineEventButton eventId={event.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
