import Link from "next/link";
import { InboxIcon } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RegistrationStatusBadge } from "@/features/registration/components/registration-status-badge";
import type { RegistrationFilters, RegistrationsTableProps } from "@/types/admin";
import type { Locale } from "@/types/i18n";

function pageHref(lang: Locale, filters: RegistrationFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.competition) params.set("competition", filters.competition);
  if (filters.status) params.set("status", filters.status);
  params.set("page", String(page));
  return `${localePath(lang, "/admin/registrations")}?${params}`;
}

export function RegistrationsTable({ list, filters, lang }: RegistrationsTableProps) {
  const t = getT(lang);
  if (list.rows.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon />
          </EmptyMedia>
          <EmptyTitle>{t("admin.registrations.emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("admin.registrations.emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const lastPage = Math.max(1, Math.ceil(list.total / list.pageSize));

  return (
    <div className="space-y-3">
      {/* Phones: one stacked row per team. */}
      <ul className="divide-y rounded-xl border md:hidden">
        {list.rows.map((row) => (
          <li key={row.id}>
            <Link href={localePath(lang, `/admin/registrations/${row.id}`)} className="hover:bg-muted/50 flex flex-col gap-1.5 p-3">
              <span className="flex items-center justify-between gap-2">
                <span className="font-medium">{row.team_name}</span>
                {row.status && <RegistrationStatusBadge status={row.status} />}
              </span>
              <span className="text-muted-foreground text-xs">
                {row.competition_name} · {row.leader_name} · {row.member_count} {t("admin.registrations.members").toLowerCase()}
              </span>
              <span className="text-muted-foreground font-mono text-xs">{row.referral_code}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.registrations.team")}</TableHead>
              <TableHead>{t("admin.registrations.competition")}</TableHead>
              <TableHead>{t("admin.registrations.leader")}</TableHead>
              <TableHead>{t("common.nisn")}</TableHead>
              <TableHead className="text-right">{t("admin.registrations.members")}</TableHead>
              <TableHead>{t("admin.registrations.status")}</TableHead>
              <TableHead>{t("admin.registrations.paymentSubmitted")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Link href={localePath(lang, `/admin/registrations/${row.id}`)} className="font-medium underline-offset-4 hover:underline">
                    {row.team_name}
                  </Link>
                  <div className="text-muted-foreground font-mono text-xs">{row.referral_code}</div>
                </TableCell>
                <TableCell>{row.competition_name}</TableCell>
                <TableCell>
                  <div>{row.leader_name}</div>
                  <div className="text-muted-foreground text-xs">
                    {row.leader_email} · {row.leader_phone}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{row.leader_nisn}</TableCell>
                <TableCell className="text-right tabular-nums">{row.member_count}</TableCell>
                <TableCell>{row.status && <RegistrationStatusBadge status={row.status} />}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{formatDateTime(row.payment_submitted_at, lang)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>{t("admin.registrations.summary", { count: list.total, page: list.page, pages: lastPage })}</span>
        <div className="flex gap-2">
          {list.page > 1 && (
            <Link href={pageHref(lang, filters, list.page - 1)} className={buttonVariants({ variant: "outline", size: "sm" })}>
              {t("common.previous")}
            </Link>
          )}
          {list.page < lastPage && (
            <Link href={pageHref(lang, filters, list.page + 1)} className={buttonVariants({ variant: "outline", size: "sm" })}>
              {t("common.next")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
