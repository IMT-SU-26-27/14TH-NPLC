import Link from "next/link";
import { ArrowLeftIcon, EyeOffIcon } from "lucide-react";
import { requireAdmin } from "@/lib/data/auth";
import { listCpCompetitions, listFocusSummary, listTeamFocusEvents } from "@/lib/data/cp";
import { formatAwayDuration, formatTimestamp } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { focusFiltersSchema } from "@/lib/validations/cp";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FocusFilters } from "@/features/cp/components/focus-filters";
import { FocusKindBadge } from "@/features/cp/components/focus-kind-badge";
import { StillAwayBadge } from "@/features/cp/components/still-away-badge";
import type { AdminFocusSectionProps, FocusFilters as Filters } from "@/types/cp";
import type { Locale } from "@/types/i18n";

function one(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function pageHref(lang: Locale, competitionId: string, filters: Filters, team?: string) {
  const params = new URLSearchParams({ competition: competitionId });
  if (team) params.set("team", team);
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.min) params.set("min", String(filters.min));
  return `${localePath(lang, "/admin/cp/activity")}?${params}`;
}

export async function AdminFocusSection({ lang, searchParams }: AdminFocusSectionProps) {
  const t = getT(lang);
  await requireAdmin();
  const [raw, competitions] = await Promise.all([searchParams, listCpCompetitions()]);
  const filters = focusFiltersSchema.parse({
    competition: one(raw.competition),
    team: one(raw.team),
    kind: one(raw.kind),
    min: one(raw.min),
  });
  const selected = competitions.find((c) => c.id === filters.competition) ?? competitions[0];

  if (!selected) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <EyeOffIcon />
          </EmptyMedia>
          <EmptyTitle>{t("admin.cp.noCompetition")}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  const filtered = !!filters.kind || filters.min > 0;
  const summary = await listFocusSummary(selected.id, filters);

  if (filters.team) {
    const team = filters.team;
    const events = await listTeamFocusEvents(selected.id, { ...filters, team });
    const row = summary.find((r) => r.registrationId === team);
    return (
      <div className="space-y-4">
        <Link href={pageHref(lang, selected.id, filters)} className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-2" })}>
          <ArrowLeftIcon />
          {t("admin.focus.allTeams")}
        </Link>
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-semibold">{row?.teamName ?? t("admin.focus.team")}</h2>
          {row && (
            <p className="text-muted-foreground text-sm">
              {t("admin.focus.teamSummary", { count: row.events, total: formatAwayDuration(row.totalMs, lang) })}
            </p>
          )}
        </div>
        <FocusFilters filters={filters} competitionId={selected.id} />
        {events.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>{t("admin.focus.emptyTitle")}</EmptyTitle>
              <EmptyDescription>{t("admin.focus.emptyFiltered")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="bg-card overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.focus.leftAt")}</TableHead>
                  <TableHead className="text-right">{t("admin.focus.length")}</TableHead>
                  <TableHead>{t("admin.focus.kind")}</TableHead>
                  <TableHead>{t("admin.focus.member")}</TableHead>
                  <TableHead>{t("admin.focus.problem")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="tabular-nums">{formatTimestamp(e.leftAt, lang)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {e.durationMs === null ? (
                        <StillAwayBadge label={t("admin.focus.stillAway")} />
                      ) : (
                        <span className="space-x-2">
                          {e.returnedByReload && <span className="text-muted-foreground text-xs">{t("admin.focus.reloaded")}</span>}
                          <span className="font-medium">{formatAwayDuration(e.durationMs, lang)}</span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <FocusKindBadge kind={e.kind} label={t(`cp.focus.kind.${e.kind}`)} />
                    </TableCell>
                    <TableCell className="max-w-48 truncate">{e.memberName ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground max-w-56 truncate">{e.problemTitle ?? t("admin.focus.problemList")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {competitions.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {competitions.map((c) => (
            <Link
              key={c.id}
              href={`${localePath(lang, "/admin/cp/activity")}?competition=${c.id}`}
              className={buttonVariants({ variant: c.id === selected.id ? "secondary" : "ghost", size: "sm" })}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
      <FocusFilters filters={filters} competitionId={selected.id} />
      {summary.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <EyeOffIcon />
            </EmptyMedia>
            <EmptyTitle>{t("admin.focus.emptyTitle")}</EmptyTitle>
            <EmptyDescription>{filtered ? t("admin.focus.emptyFiltered") : t("admin.focus.emptyDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">
            {t("admin.focus.summaryLine", { teams: summary.length, events: summary.reduce((n, r) => n + r.events, 0) })}
          </p>
          <div className="bg-card overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.focus.team")}</TableHead>
                  <TableHead className="text-right">{t("admin.focus.events")}</TableHead>
                  <TableHead className="text-right">{t("admin.focus.totalAway")}</TableHead>
                  <TableHead className="text-right">{t("admin.focus.longest")}</TableHead>
                  <TableHead className="text-right">{t("cp.focus.kind.tab_hidden")}</TableHead>
                  <TableHead className="text-right">{t("cp.focus.kind.window_blur")}</TableHead>
                  <TableHead className="text-right">{t("cp.focus.kind.fullscreen_exit")}</TableHead>
                  <TableHead>{t("admin.focus.lastLeft")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map((r) => (
                  <TableRow key={r.registrationId}>
                    <TableCell className="max-w-56">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={pageHref(lang, selected.id, filters, r.registrationId)}
                          className="truncate font-medium underline-offset-4 hover:underline"
                        >
                          {r.teamName}
                        </Link>
                        {r.openEvents > 0 && <StillAwayBadge label={t("admin.focus.stillAway")} />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.events}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatAwayDuration(r.totalMs, lang)}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.longestMs === null ? "—" : formatAwayDuration(r.longestMs, lang)}</TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">{r.tabHidden}</TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">{r.windowBlur}</TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">{r.fullscreenExit}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{formatTimestamp(r.lastLeftAt, lang)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
