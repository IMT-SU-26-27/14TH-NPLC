import Link from "next/link";
import { CheckIcon, TrophyIcon } from "lucide-react";
import { formatDateTime, formatRupiah, formatTeamSize } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CompetitionsTableProps } from "@/types/admin";

export function CompetitionsTable({ competitions, lang }: CompetitionsTableProps) {
  const t = getT(lang);

  if (competitions.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TrophyIcon />
          </EmptyMedia>
          <EmptyTitle>{t("admin.competitions.emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("admin.competitions.emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("admin.competitions.name")}</TableHead>
            <TableHead>{t("admin.competitions.type")}</TableHead>
            <TableHead>{t("admin.registrations.members")}</TableHead>
            <TableHead className="text-right">{t("admin.competitions.fee")}</TableHead>
            <TableHead>{t("admin.competitions.registration")}</TableHead>
            <TableHead>{t("admin.competitions.qris")}</TableHead>
            <TableHead>{t("admin.registrations.status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {competitions.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <Link href={localePath(lang, `/admin/competitions/${c.id}`)} className="font-medium underline-offset-4 hover:underline">
                  {c.name}
                </Link>
                <div className="text-muted-foreground font-mono text-xs">{c.slug}</div>
              </TableCell>
              <TableCell>{t(`competition.type.${c.type}`)}</TableCell>
              <TableCell>{formatTeamSize(c.min_members, c.max_members, lang)}</TableCell>
              <TableCell className="text-right">{formatRupiah(c.fee, lang)}</TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {formatDateTime(c.registration_opens_at, lang)} – {formatDateTime(c.registration_closes_at, lang)}
              </TableCell>
              <TableCell>{c.qris_public_id ? <CheckIcon className="text-primary size-4" aria-label="QRIS" /> : "—"}</TableCell>
              <TableCell>
                <Badge variant={c.is_active ? "default" : "outline"}>
                  {c.is_active ? t("admin.competitions.activeBadge") : t("admin.competitions.inactive")}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
