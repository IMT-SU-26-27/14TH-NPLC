"use client";

import { ExternalLinkIcon } from "lucide-react";
import { contactFor, whatsappUrl } from "@/lib/event-info";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/shared/whatsapp-icon";
import type { TeamMembersProps } from "@/types/registration";

const chip = "h-5 rounded-[6px] px-1.5 font-mono text-[11px] tracking-[0.1em] uppercase";
// Same small muted label as the account card's NAMA / EMAIL.
const dataLabel = "text-muted-foreground font-mono text-[11px] font-medium tracking-[0.14em] uppercase";

// Read-only list: only admins change a team's members (HOD, 10 Nov). Participants ask the competition's contact person.
export function TeamMembers({ team, userId }: TeamMembersProps) {
  const { t } = useI18n();
  const contact = contactFor(team.competition.type);

  return (
    <ul className="space-y-2.5">
      {team.members.map((member) => {
        const isSelf = member.user_id === userId;
        return (
          <li key={member.id} className="bg-card ring-border rounded-[12px] px-3.5 py-3 ring-1">
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
          </li>
        );
      })}
      <li className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-1">
        <p className="text-muted-foreground text-sm">{t("dashboard.membersViaContact")}</p>
        {contact && (
          <a
            href={whatsappUrl(contact.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "max-w-full")}
          >
            <WhatsappIcon data-icon="inline-start" />
            <span className="truncate">{`${contact.label} · ${contact.name}`}</span>
            <span className="sr-only">{` (${t("landing.contact.opensWhatsapp")})`}</span>
          </a>
        )}
      </li>
    </ul>
  );
}
