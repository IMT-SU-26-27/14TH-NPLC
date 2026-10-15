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
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
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

export function TeamMembers({ team, userId, canEdit }: TeamMembersProps) {
  const { t } = useI18n();
  const isLeader = team.leader_id === userId;

  return (
    <ItemGroup className="gap-2">
      {team.members.map((member) => {
        const isSelf = member.user_id === userId;
        const canAct = canEdit && !member.is_leader && (isLeader || isSelf);
        return (
          <Item key={member.id} variant="outline" size="sm">
            <ItemContent>
              <ItemTitle>
                {member.full_name}
                {member.is_leader && <Badge variant="secondary">{t("common.leader")}</Badge>}
                {isSelf && <Badge variant="outline">{t("common.you")}</Badge>}
              </ItemTitle>
              <ItemDescription>
                {member.email} · NISN <span className="font-mono">{member.nisn}</span>
                {member.phone && <> · <span className="font-mono">{member.phone}</span></>}
              </ItemDescription>
            </ItemContent>
            {canAct && (
              <ItemActions>
                <MemberAction member={member} isSelf={isSelf} />
              </ItemActions>
            )}
          </Item>
        );
      })}
    </ItemGroup>
  );
}
