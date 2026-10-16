import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AccountCardProps } from "@/types/registration";

export function AccountCard({ user, lang }: AccountCardProps) {
  const t = getT(lang);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.account")}</CardTitle>
        <CardDescription>{t("dashboard.accountLead")}</CardDescription>
        <CardAction className="flex items-center gap-2">
          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
            {user.role === "admin" ? t("dashboard.admin") : t("dashboard.participant")}
          </Badge>
          <Link href={localePath(lang, "/profile")} className={buttonVariants({ variant: "outline", size: "sm" })}>
            {t("dashboard.editProfile")}
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">{t("dashboard.name")}</dt>
            <dd className="font-medium">{user.full_name || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("common.email")}</dt>
            <dd className="font-medium break-all">{user.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("dashboard.memberSince")}</dt>
            <dd className="font-medium">{formatDateTime(user.created_at, lang)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
