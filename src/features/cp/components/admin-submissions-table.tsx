import Link from "next/link";
import { FileCodeIcon } from "lucide-react";
import { formatTimestamp } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/shared/table-pagination";
import { VerdictBadge } from "@/features/cp/components/verdict-badge";
import type { AdminSubmissionsTableProps, SubmissionFilters } from "@/types/cp";
import type { Locale } from "@/types/i18n";

function pageHref(lang: Locale, competitionId: string, filters: SubmissionFilters, page: number) {
  const params = new URLSearchParams({ competition: competitionId });
  if (filters.q) params.set("q", filters.q);
  if (filters.problem) params.set("problem", filters.problem);
  if (filters.team) params.set("team", filters.team);
  if (filters.verdict) params.set("verdict", filters.verdict);
  params.set("page", String(page));
  return `${localePath(lang, "/admin/cp/submissions")}?${params}`;
}

export function AdminSubmissionsTable({ list, filters, competitionId, lang }: AdminSubmissionsTableProps) {
  const t = getT(lang);
  const lastPage = Math.max(1, Math.ceil(list.total / list.pageSize));
  const filtered = !!(filters.q || filters.problem || filters.team || filters.verdict);

  if (list.rows.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileCodeIcon />
          </EmptyMedia>
          <EmptyTitle>{t("admin.submissions.emptyTitle")}</EmptyTitle>
          <EmptyDescription>{filtered ? t("admin.submissions.emptyFiltered") : t("admin.submissions.emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.submissions.submitted")}</TableHead>
              <TableHead>{t("admin.submissions.team")}</TableHead>
              <TableHead>{t("admin.submissions.problem")}</TableHead>
              <TableHead>{t("cp.language")}</TableHead>
              <TableHead>{t("admin.submissions.verdict")}</TableHead>
              <TableHead className="text-right">{t("admin.submissions.tests")}</TableHead>
              <TableHead className="text-right">{t("admin.submissions.score")}</TableHead>
              <TableHead className="text-right">{t("admin.submissions.time")}</TableHead>
              <TableHead className="text-right">{t("admin.submissions.memory")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Link href={localePath(lang, `/admin/cp/submissions/${s.id}`)} className="font-medium underline-offset-4 hover:underline">
                    {formatTimestamp(s.created_at, lang)}
                  </Link>
                </TableCell>
                <TableCell className="max-w-48 truncate">{s.team.team_name}</TableCell>
                <TableCell className="max-w-56 truncate">
                  <span className="text-muted-foreground tabular-nums">{s.problem.level}.</span> {s.problem.title}
                </TableCell>
                <TableCell>{t(`cp.languages.${s.language}`)}</TableCell>
                <TableCell>
                  <VerdictBadge verdict={s.verdict} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {s.passed}/{s.total}
                </TableCell>
                <TableCell className="text-right tabular-nums">{Number(s.score).toFixed(2)}</TableCell>
                <TableCell className="text-muted-foreground text-right tabular-nums">{s.max_time_ms === null ? "—" : `${s.max_time_ms} ms`}</TableCell>
                <TableCell className="text-muted-foreground text-right tabular-nums">
                  {s.max_memory_kb === null ? "—" : `${Math.round(s.max_memory_kb / 1024)} MB`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        page={list.page}
        pageCount={lastPage}
        hrefFor={(page) => pageHref(lang, competitionId, filters, page)}
        summary={t("admin.submissions.summary", { count: list.total, page: list.page, pages: lastPage })}
        previousLabel={t("common.previous")}
        nextLabel={t("common.next")}
      />
    </div>
  );
}
