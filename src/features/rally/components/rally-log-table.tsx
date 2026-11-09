import { HistoryIcon } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/shared/table-pagination";
import type { RallyFilters, RallyLogTableProps } from "@/types/rally";

function pageHref(base: string, filters: RallyFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.post) params.set("post", filters.post);
  if (filters.team) params.set("team", filters.team);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function RallyLogTable({ list, filters, lang }: RallyLogTableProps) {
  const t = getT(lang);
  const lastPage = Math.max(1, Math.ceil(list.total / list.pageSize));
  const base = localePath(lang, "/admin/rally/log");

  if (list.rows.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HistoryIcon />
          </EmptyMedia>
          <EmptyTitle>{t("rally.log.emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("rally.log.emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const describe = (outcome: string | null, points: number | null) =>
    outcome ? `${t(`rally.outcome.${outcome}`)} (${t("rally.lo.points", { points: points ?? 0 })})` : "—";

  return (
    <div className="space-y-4">
      <div className="bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("rally.log.when")}</TableHead>
              <TableHead>{t("rally.log.action")}</TableHead>
              <TableHead>{t("rally.results.team")}</TableHead>
              <TableHead>{t("rally.results.post")}</TableHead>
              <TableHead>{t("rally.log.change")}</TableHead>
              <TableHead>{t("rally.log.actor")}</TableHead>
              <TableHead>{t("rally.log.reason")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-muted-foreground text-xs">{formatDateTime(row.created_at, lang)}</TableCell>
                <TableCell>
                  <Badge variant={row.action === "recorded" ? "secondary" : "outline"}>{t(`rally.log.actions.${row.action}`)}</Badge>
                </TableCell>
                <TableCell className="font-medium">{row.registration.team_name}</TableCell>
                <TableCell>{row.post.name}</TableCell>
                <TableCell>
                  {describe(row.old_outcome, row.old_points)} → {describe(row.new_outcome, row.new_points)}
                </TableCell>
                <TableCell>{row.actor?.full_name ?? "—"}</TableCell>
                <TableCell className="max-w-64 whitespace-normal">{row.action === "undone" ? "—" : (row.reason ?? "—")}</TableCell>
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
