import { BanIcon, InfoIcon } from "lucide-react";
import { contactFor, whatsappUrl } from "@/lib/event-info";
import { formatDateTime } from "@/lib/format";
import { getT } from "@/lib/i18n/get-dictionary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DisqualifiedResultProps } from "@/types/cp";

// Screen 6, disqualified: the team's status, the committee's reason and who to contact.
export function DisqualifiedResult({ lang, teamName, disqualifiedAt, reason }: DisqualifiedResultProps) {
  const t = getT(lang);
  const contact = contactFor("competitive_programming");

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Badge variant="destructive">
          <BanIcon />
          {t("cp.result.disqualifiedBadge")}
        </Badge>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
          {t("cp.result.disqualifiedTitle", { team: teamName })}
        </h1>
        <p className="text-muted-foreground">{t("cp.result.disqualifiedLead")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("cp.result.noteTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
            {reason && (
              <>
                <dt className="text-muted-foreground">{t("cp.result.reason")}</dt>
                <dd className="whitespace-pre-line">{reason}</dd>
              </>
            )}
            <dt className="text-muted-foreground">{t("cp.result.since")}</dt>
            <dd className="font-mono tabular-nums">{formatDateTime(disqualifiedAt, lang)}</dd>
          </dl>
          <p className="text-muted-foreground text-sm">{t("cp.result.final")}</p>
        </CardContent>
      </Card>

      {contact && (
        <Alert>
          <InfoIcon />
          <AlertDescription>
            <p>
              {t("cp.result.contact", { name: contact.name })}{" "}
              <a
                href={whatsappUrl(contact.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="text-foreground font-mono underline underline-offset-4"
              >
                {contact.display}
              </a>
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
