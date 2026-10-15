"use client";

import { UserMinusIcon } from "lucide-react";
import { adminRemoveMember } from "@/lib/actions/admin-registrations";
import { useConfirmAction } from "@/hooks/use-confirm-action";
import { useI18n } from "@/hooks/use-i18n";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminMembersTableProps, AdminRemoveMemberButtonProps } from "@/types/admin";

function RemoveMemberButton({ memberId, name }: AdminRemoveMemberButtonProps) {
  const { open, setOpen, pending, run } = useConfirmAction();
  const { t } = useI18n();
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label={t("admin.detail.removeMember", { name })} />}>
        <UserMinusIcon />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("admin.detail.removeMember", { name })}</AlertDialogTitle>
          <AlertDialogDescription>{t("admin.detail.removeMemberDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={() => run(() => adminRemoveMember(memberId), "admin.detail.memberRemoved")}>
            {pending && <Spinner />}
            {t("dashboard.remove")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AdminMembersTable({ team }: AdminMembersTableProps) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("dashboard.name")}</TableHead>
            <TableHead>{t("common.email")}</TableHead>
            <TableHead>{t("common.phone")}</TableHead>
            <TableHead>{t("common.nisn")}</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {team.members.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">
                {m.full_name} {m.is_leader && <Badge variant="secondary">{t("common.leader")}</Badge>}
              </TableCell>
              <TableCell>{m.email}</TableCell>
              <TableCell>{m.phone ?? "—"}</TableCell>
              <TableCell className="font-mono text-xs">{m.nisn}</TableCell>
              <TableCell>{!m.is_leader && <RemoveMemberButton memberId={m.id} name={m.full_name} />}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
