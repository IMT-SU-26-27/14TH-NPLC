"use client";

import { CircleQuestionMarkIcon } from "lucide-react";
import { GUIDE_VERDICTS } from "@/lib/cp/verdict-guide";
import { useI18n } from "@/hooks/use-i18n";
import { useVerdictGuide } from "@/hooks/use-verdict-guide";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { VerdictBadge } from "@/features/cp/components/verdict-badge";
import type { VerdictGuideEntry } from "@/types/cp";

// Floating (?) button on every contest page. Opens a reference of every judging result:
// what it means, common causes and what to try. Error toasts open it at their verdict.
export function VerdictGuide() {
  const { t, dict } = useI18n();
  const guide = useVerdictGuide();
  const entries = dict.cp.verdict as Record<string, VerdictGuideEntry>;

  return (
    <Sheet open={guide.open} onOpenChange={guide.onOpenChange}>
      <Button
        variant="outline"
        size="icon-lg"
        className="fixed right-4 bottom-4 z-40 size-11 rounded-full sm:right-6 sm:bottom-6"
        aria-label={t("cp.guideButton")}
        title={t("cp.guideButton")}
        onClick={() => guide.onOpenChange(true)}
      >
        <CircleQuestionMarkIcon className="size-5" />
      </Button>
      <SheetContent side="right" className="w-full gap-0 data-[side=right]:sm:max-w-lg">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>{t("cp.guideTitle")}</SheetTitle>
          <SheetDescription>{t("cp.guideLead")}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto p-4 pb-10">
          <section className="space-y-2">
            <h3 className="font-medium">{t("cp.guideJudging")}</h3>
            <ul className="text-muted-foreground list-disc space-y-1 pl-5">
              <li>{t("cp.judgeA")}</li>
              <li>{t("cp.judgeB")}</li>
              <li>{t("cp.judgeC")}</li>
            </ul>
          </section>
          <Separator />
          {GUIDE_VERDICTS.map((verdict) => {
            const entry = entries[verdict];
            return (
              <section
                key={verdict}
                id={`verdict-guide-${verdict}`}
                aria-labelledby={`verdict-guide-${verdict}-title`}
                tabIndex={-1}
                className={cn(
                  "scroll-mt-4 space-y-3 rounded-xl border p-4 outline-none transition-colors",
                  guide.target === verdict && "border-ring ring-ring/50 ring-3",
                )}
              >
                <div className="space-y-1.5">
                  <h3 id={`verdict-guide-${verdict}-title`}>
                    <VerdictBadge verdict={verdict} />
                  </h3>
                  <p>{entry.description}</p>
                </div>
                {entry.causes && (
                  <div className="space-y-1">
                    <h4 className="text-muted-foreground text-xs font-medium">{t("cp.guideCauses")}</h4>
                    <ul className="list-disc space-y-1 pl-5">
                      {entry.causes.map((cause) => (
                        <li key={cause}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {entry.fixes && (
                  <div className="space-y-1">
                    <h4 className="text-muted-foreground text-xs font-medium">{t("cp.guideFixes")}</h4>
                    <ul className="list-disc space-y-1 pl-5">
                      {entry.fixes.map((fix) => (
                        <li key={fix}>{fix}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
