import { LockKeyholeIcon } from "lucide-react";
import { getT } from "@/lib/i18n/get-dictionary";
import type { AccountNoteProps } from "@/types/registration";

// One account, one team: shown once the account is on a team.
export function AccountNote({ teamName, lang }: AccountNoteProps) {
  const t = getT(lang);

  return (
    <section className="bg-card ring-border flex gap-4 rounded-[12px] p-6 ring-1 sm:p-7">
      <span className="bg-accent text-accent-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
        <LockKeyholeIcon aria-hidden className="size-[18px]" />
      </span>
      <div className="space-y-0.5 text-sm">
        <h2 className="font-medium">{t("dashboard.oneAccountTitle")}</h2>
        <p className="text-muted-foreground">{t("dashboard.oneAccountDescription", { team: teamName })}</p>
      </div>
    </section>
  );
}
