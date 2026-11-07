import { CodeXmlIcon, NetworkIcon } from "lucide-react";
import { formatDateTime, formatRupiah, formatTeamSize } from "@/lib/format";
import { getT } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { RegisterSummaryProps } from "@/types/registration";

// "// Ringkasan" card beside the form: what this competition costs and its rules in three lines.
export function RegisterSummary({ competition, lang }: RegisterSummaryProps) {
  const t = getT(lang);
  const Icon = competition.type === "competitive_programming" ? CodeXmlIcon : NetworkIcon;
  const size = formatTeamSize(competition.min_members, competition.max_members, lang);
  const notes = [
    t("competition.teamOf", { size }),
    competition.payment_method === "bank_transfer" ? t("register.payBank") : t("register.payQris"),
    competition.registration_closes_at ? t("competition.closes", { date: formatDateTime(competition.registration_closes_at, lang) }) : null,
  ].filter((note): note is string => note !== null);

  return (
    <Card className="ring-border rounded-xl">
      <CardHeader className="gap-4">
        <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">{`// ${t("register.summary")}`}</p>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              competition.type === "competitive_programming" ? "bg-primary text-primary-foreground" : "bg-highlight text-highlight-foreground",
            )}
          >
            <Icon aria-hidden className="size-4" />
          </span>
          <div>
            <p className="font-semibold">{competition.name}</p>
            <p className="text-muted-foreground text-sm">{size}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-primary font-mono text-[0.65rem] tracking-[0.2em] uppercase">{t("competition.fee")}</p>
          <p className="font-heading text-3xl font-bold">{formatRupiah(competition.fee, lang)}</p>
        </div>
        <ul className="space-y-2 border-t pt-4 text-sm">
          {notes.map((note) => (
            <li key={note} className="flex gap-2">
              <span aria-hidden className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
              {note}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
