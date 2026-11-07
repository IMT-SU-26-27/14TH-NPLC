import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { COMPETITIONS_TAG, getActiveCompetitions } from "@/lib/data/competitions";
import { EARLY_BIRD, earlyBirdEndsAt } from "@/lib/event-info";
import { formatDateRange, formatRupiah } from "@/lib/format";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { currentFee } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EarlyBirdRing } from "@/features/landing/components/early-bird-ring";
import { SectionHeading } from "@/features/landing/components/section-heading";
import type { LangProps } from "@/types/i18n";

const DAY = 86_400_000;

// "05 // Biaya". The normal price is the highest fee set on a competition (Figma shows one price for both).
export async function FeeSection({ lang }: LangProps) {
  "use cache";
  cacheLife("minutes");
  cacheTag(COMPETITIONS_TAG);

  const t = getT(lang);
  const competitions = await getActiveCompetitions();
  if (competitions.length === 0) return null;

  const normalFee = Math.max(...competitions.map((c) => c.fee));
  // Same price the registration form charges, so Home and the payment step never disagree.
  const fee = currentFee(normalFee);
  const earlyBird = fee < normalFee;
  const endsAt = earlyBirdEndsAt();
  const totalDays = Math.round((endsAt.getTime() - new Date(`${EARLY_BIRD.startsOn}T00:00:00+07:00`).getTime()) / DAY);
  const lastDay = formatDateRange(EARLY_BIRD.endsOn, null, lang);

  return (
    <section id="fees" className="mx-auto max-w-6xl scroll-mt-14 space-y-10 px-4 py-20 sm:py-28">
      <SectionHeading index="05" label={t("landing.fees.label")} title={t("landing.fees.title")} />
      <Card className="ring-border rounded-[12px] py-0">
        <CardContent className={cn("grid items-center gap-8 p-6 sm:p-8", earlyBird ? "lg:grid-cols-[auto_1fr_auto]" : "lg:grid-cols-[1fr_auto]")}>
          {earlyBird && <EarlyBirdRing totalDays={totalDays} endsAt={endsAt.toISOString()} />}

          <div className="space-y-2">
            {earlyBird ? (
              <>
                <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
                  {t("landing.fees.period", { range: formatDateRange(EARLY_BIRD.startsOn, EARLY_BIRD.endsOn, lang) })}
                </p>
                <p className="text-muted-foreground text-lg line-through">
                  <span className="sr-only">{`${t("landing.competitions.normalPrice")} `}</span>
                  {formatRupiah(normalFee, lang)}
                </p>
                <p className="font-heading text-5xl leading-none font-bold tracking-tight sm:text-6xl">
                  <span className="sr-only">{`${t("landing.competitions.earlyPrice")} `}</span>
                  {formatRupiah(fee, lang)}
                </p>
              </>
            ) : (
              <p className="font-heading text-5xl leading-none font-bold tracking-tight sm:text-6xl">{formatRupiah(normalFee, lang)}</p>
            )}
            <p className="text-muted-foreground text-sm">{t("landing.fees.appliesTo")}</p>
          </div>

          <div className="space-y-4 lg:w-72 lg:border-l lg:pl-8">
            <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">{`// ${t("landing.fees.paymentLabel")}`}</p>
            <p className="text-sm">{t("landing.fees.payment")}</p>
            <Link
              href={localePath(lang, "/register")}
              className={cn(buttonVariants({ size: "lg" }), "bg-highlight text-highlight-foreground hover:bg-highlight/80 h-11 w-full px-5")}
            >
              {earlyBird ? t("landing.fees.ctaBefore", { date: lastDay }) : t("landing.fees.cta")}
              <ArrowRightIcon />
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
