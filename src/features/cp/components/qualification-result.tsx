import { PartyPopperIcon, TrophyIcon } from "lucide-react";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import type { QualificationResultProps } from "@/types/cp";

// Screen 6, made the final or not. Plain version with the real data; the v89 layout (invitation details,
// team summary) is built on top of this by the screens team.
export function QualificationResult({ lang, teamName, qualified }: QualificationResultProps) {
  const t = getT(lang);
  return (
    <div className="space-y-1.5">
      <Badge variant={qualified ? "default" : "secondary"} className={qualified ? "bg-success text-success-foreground" : undefined}>
        {qualified ? <TrophyIcon /> : <PartyPopperIcon />}
        {qualified ? t("cp.result.qualifiedBadge") : t("cp.result.notQualifiedBadge")}
      </Badge>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
        {t(qualified ? "cp.result.qualifiedTitle" : "cp.result.notQualifiedTitle", { team: teamName })}
      </h1>
      <p className="text-muted-foreground">{t(qualified ? "cp.result.qualifiedLead" : "cp.result.notQualifiedLead")}</p>
    </div>
  );
}
