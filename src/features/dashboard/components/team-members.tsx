"use client";

import { LogOutIcon, UserMinusIcon } from "lucide-react";
import { removeMember } from "@/lib/actions/registration";
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
import type { MemberActionProps, TeamMembersProps } from "@/types/registration";

function MemberAction({ member, isSelf }: MemberActionProps) {
  const { open, setOpen, pending, run } = useConfirmAction();
  const { t } = useI18n();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="ghost" size="sm" />}>
        {isSelf ? <LogOutIcon /> : <UserMinusIcon />}
        {isSelf ? t("dashboard.leave") : t("dashboard.remove")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isSelf ? t("dashboard.leaveTitle") : t("dashboard.removeTitle", { name: member.full_name })}</AlertDialogTitle>
          <AlertDialogDescription>
            {isSelf ? t("dashboard.leaveDescription") : t("dashboard.removeDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={() => run(() => removeMember(member.id), isSelf ? "dashboard.youLeft" : "dashboard.memberRemoved")}
          >
            {pending && <Spinner />}
            {isSelf ? t("dashboard.leaveConfirm") : t("dashboard.remove")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const chip = "h-5 rounded-[6px] px-1.5 font-mono text-[11px] tracking-[0.1em] uppercase";

export function TeamMembers({ team, userId, canEdit }: TeamMembersProps) {
  const { t } = useI18n();
  const isLeader = team.leader_id === userId;

  return (
    <ul className="space-y-2.5">
      {team.members.map((member) => {
        const isSelf = member.user_id === userId;
        const canAct = canEdit && !member.is_leader && (isLeader || isSelf);
        return (
          <li key={member.id} className="bg-card ring-border flex items-start justify-between gap-3 rounded-[12px] px-3.5 py-3 ring-1">
            <div className="min-w-0 space-y-1 text-sm">
              <p className="flex flex-wrap items-center gap-2 font-medium">
                {member.full_name}
                {member.is_leader && <Badge variant="secondary" className={chip}>{t("common.leader")}</Badge>}
                {isSelf && <Badge variant="secondary" className={chip}>{t("common.you")}</Badge>}
              </p>
              <p className="text-muted-foreground break-words">
                {[member.email, t("dashboard.memberNisn", { nisn: member.nisn }), member.phone && t("dashboard.memberWhatsapp", { phone: member.phone })].filter(Boolean).join(" · ")}
              </p>
            </div>
            {canAct && <MemberAction member={member} isSelf={isSelf} />}
          </li>
        );
      })}
    </ul>
  );
}
