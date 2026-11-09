"use client";

import { ExternalLinkIcon, LogOutIcon, UserMinusIcon } from "lucide-react";
import { contactFor, whatsappUrl } from "@/lib/event-info";
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
import { WhatsappIcon } from "@/components/shared/whatsapp-icon";
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
// Same small muted label as the account card's NAMA / EMAIL.
const dataLabel = "text-muted-foreground font-mono text-[11px] font-medium tracking-[0.14em] uppercase";

export function TeamMembers({ team, userId, canEdit }: TeamMembersProps) {
  const { t } = useI18n();
  const isLeader = team.leader_id === userId;
  // Members are fixed once an admin accepts the team; changes go through the competition's contact person.
  const locked = team.status === "accepted";
  const contact = contactFor(team.competition.type);

  return (
    <ul className="space-y-2.5">
      {team.members.map((member) => {
        const isSelf = member.user_id === userId;
        const canAct = canEdit && !locked && !member.is_leader && (isLeader || isSelf);
        return (
          <li key={member.id} className="bg-card ring-border flex items-start justify-between gap-3 rounded-[12px] px-3.5 py-3 ring-1">
            <div className="min-w-0 space-y-1 text-sm">
              <p className="flex flex-wrap items-center gap-2 font-medium">
                {member.full_name}
                {member.is_leader && <Badge variant="secondary" className={chip}>{t("common.leader")}</Badge>}
                {isSelf && <Badge variant="secondary" className={chip}>{t("common.you")}</Badge>}
              </p>
              {/* One fact per line: label on the left, value beside it. Numbers in mono. */}
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 gap-y-0.5">
                <dt className={dataLabel}>{t("common.email")}</dt>
                <dd className="break-all">{member.email}</dd>
                <dt className={dataLabel}>{t("common.nisn")}</dt>
                <dd className="font-mono">{member.nisn}</dd>
                {member.phone && (
                  <>
                    <dt className={dataLabel}>{t("dashboard.memberWhatsapp")}</dt>
                    <dd className="font-mono">{member.phone}</dd>
                  </>
                )}
              </dl>
              {member.twibbon_post_url && (
                <a
                  href={member.twibbon_post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3"
                >
                  {t("twibbon.postLink")}
                  <ExternalLinkIcon aria-hidden className="size-3.5" />
                </a>
              )}
            </div>
            {canAct && <MemberAction member={member} isSelf={isSelf} />}
          </li>
        );
      })}
      {locked && canEdit && (
        <li className="text-muted-foreground text-sm">
          {t("dashboard.membersLocked")}{" "}
          {contact && (
            <a
              href={whatsappUrl(contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3"
            >
              <WhatsappIcon aria-hidden className="size-3.5" />
              {`${contact.label} · ${contact.name}`}
            </a>
          )}
        </li>
      )}
    </ul>
  );
}
