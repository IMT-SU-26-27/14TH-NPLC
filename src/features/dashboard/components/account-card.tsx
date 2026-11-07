import Link from "next/link";
import { LockKeyholeIcon } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { AccountCardProps, AccountNoteProps } from "@/types/registration";

const label = "text-muted-foreground font-mono text-xs";

export function AccountCard({ user, lang }: AccountCardProps) {
  const t = getT(lang);

  return (
    <section className="bg-card ring-border space-y-4 rounded-[12px] p-6 ring-1 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-primary font-mono text-xs font-medium tracking-[0.14em] uppercase">{`// ${t("dashboard.account")}`}</h2>
        <div className="flex items-center gap-2">
          {user.role === "admin" && <Badge>{t("dashboard.admin")}</Badge>}
          <Link href={localePath(lang, "/profile")} className={buttonVariants({ variant: "outline", size: "sm" })}>
            {t("dashboard.editProfile")}
          </Link>
        </div>
      </div>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className={label}>{t("dashboard.name")}</dt>
          <dd className="font-medium">{user.full_name || "—"}</dd>
        </div>
        <div>
          <dt className={label}>{t("common.email")}</dt>
          <dd className="font-medium break-all">{user.email}</dd>
        </div>
        <div>
          <dt className={label}>{t("dashboard.memberSince")}</dt>
          <dd className="font-medium">{formatDateTime(user.created_at, lang)}</dd>
        </div>
      </dl>
    </section>
  );
}

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
