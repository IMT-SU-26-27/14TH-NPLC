import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { AccountCardProps } from "@/types/registration";

const label = "text-muted-foreground font-mono text-[11px] font-medium tracking-[0.14em] uppercase";

export function AccountCard({ user, lang }: AccountCardProps) {
  const t = getT(lang);

  return (
    <section className="bg-card ring-border space-y-4 rounded-[12px] p-6 ring-1 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-primary font-mono text-xs font-medium tracking-[0.14em] uppercase">{`// ${t("dashboard.account")}`}</h2>
        <div className="flex items-center gap-2">
          {user.role === "admin" && <Badge>{t("dashboard.admin")}</Badge>}
          <Link href={localePath(lang, "/profile")} className={cn(buttonVariants({ variant: "outline" }), "border-primary text-primary h-9 rounded-[8px] px-4.5")}>
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
