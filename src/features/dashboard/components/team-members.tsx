"use client";

import { LogOutIcon, UserMinusIcon } from "lucide-react";
import { removeMember } from "@/lib/actions/registration";
import { useConfirmAction } from "@/hooks/use-confirm-action";
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

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="ghost" size="sm" />}>
        {isSelf ? <LogOutIcon /> : <UserMinusIcon />}
        {isSelf ? "Leave" : "Remove"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isSelf ? "Leave this team?" : `Remove ${member.full_name}?`}</AlertDialogTitle>
          <AlertDialogDescription>
            {isSelf
              ? "You can join again later with the team code while the team is still open."
              : "They can rejoin with the team code while the team is still open."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={() => run(() => removeMember(member.id), isSelf ? "You left the team" : "Member removed")}
          >
            {pending && <Spinner />}
            {isSelf ? "Leave team" : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function TeamMembers({ team, userId }: TeamMembersProps) {
  const editable = team.status === "pending_payment" || team.status === "rejected";
  const isLeader = team.leader_id === userId;

  return (
    <ItemGroup className="gap-2">
      {team.members.map((member) => {
        const isSelf = member.user_id === userId;
        const canAct = editable && !member.is_leader && (isLeader || isSelf);
        return (
          <Item key={member.id} variant="outline" size="sm">
            <ItemContent>
              <ItemTitle>
                {member.full_name}
                {member.is_leader && <Badge variant="secondary">Leader</Badge>}
                {isSelf && <Badge variant="outline">You</Badge>}
              </ItemTitle>
              <ItemDescription>
                {member.email} · NISN {member.nisn}
                {member.phone ? ` · ${member.phone}` : ""}
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
