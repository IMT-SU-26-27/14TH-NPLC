import Link from "next/link";
import { ListChecksIcon } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/shared/table-pagination";
import { LoOutcomeBadge } from "@/features/rally/components/lo-outcome-badge";
import { RallyResultActions } from "@/features/rally/components/rally-result-actions";
import type { RallyFilters, RallyResultsTableProps } from "@/types/rally";

function pageHref(base: string, filters: RallyFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.post) params.set("post", filters.post);
  if (filters.team) params.set("team", filters.team);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function RallyResultsTable({ list, filters, lang }: RallyResultsTableProps) {
  const t = getT(lang);
  const lastPage = Math.max(1, Math.ceil(list.total / list.pageSize));
  const base = localePath(lang, "/admin/rally/results");

  if (list.rows.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListChecksIcon />
          </EmptyMedia>
          <EmptyTitle>{t("rally.results.emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("rally.results.emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("rally.results.team")}</TableHead>
              <TableHead>{t("rally.results.post")}</TableHead>
              <TableHead>{t("rally.results.result")}</TableHead>
              <TableHead>{t("rally.results.recordedBy")}</TableHead>
              <TableHead>{t("rally.results.recordedAt")}</TableHead>
              <TableHead className="w-44" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">
                  {row.registration.team_name}
                  {row.registration.school && <span className="text-muted-foreground block text-xs font-normal">{row.registration.school}</span>}
                </TableCell>
                <TableCell>{row.post.name}</TableCell>
                <TableCell>
                  <LoOutcomeBadge outcome={row.outcome} points={row.points} />
                </TableCell>
                <TableCell>
                  {row.recorder?.full_name ?? "—"}
                  {row.corrector && (
                    <span className="text-muted-foreground block text-xs">{t("rally.results.correctedBy", { name: row.corrector.full_name })}</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{formatDateTime(row.recorded_at, lang)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <RallyResultActions result={row} />
                    <Link
                      href={`${localePath(lang, "/admin/rally/log")}?team=${row.registration.id}`}
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      {t("rally.results.history")}
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        page={list.page}
        pageCount={lastPage}
        hrefFor={(page) => pageHref(base, filters, page)}
        summary={t("rally.results.summary", { count: list.total, page: list.page, pages: lastPage })}
        previousLabel={t("common.previous")}
        nextLabel={t("common.next")}
      />
    </div>
  );
}
