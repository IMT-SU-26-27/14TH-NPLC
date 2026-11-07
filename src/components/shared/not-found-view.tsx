"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageBand } from "@/components/shared/page-band";
import { cn } from "@/lib/utils";

// not-found.tsx receives no params, so the language comes from the I18nProvider in the layout.
export function NotFoundView() {
  const { t, href } = useI18n();

  return (
    <main className="flex-1">
      <PageBand index="05" label={t("system.notFoundLabel")} title={t("system.notFoundTitle")} lead={t("system.notFoundLead")} mascot={{ src: "/shared/maskot-4.webp" }} />
      <div className="mx-auto w-full max-w-140 px-4 pt-8 pb-12 sm:pt-12 sm:pb-16">
        <Card className="ring-border rounded-[12px] gap-5 py-6 sm:gap-5.5 sm:py-9">
          <CardContent className="flex flex-col gap-4.5 px-5 sm:gap-5.5 sm:px-10">
            <p className="text-destructive font-mono text-xs font-medium tracking-[0.14em] uppercase">{t("system.notFoundCode")}</p>
            <p aria-hidden className="font-heading from-primary to-brand-purple bg-linear-to-r bg-clip-text text-7xl leading-none font-extrabold tracking-wide text-transparent sm:text-[7rem]">
              404
            </p>
            <p className="text-muted-foreground text-base text-pretty">{t("system.notFoundDescription")}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={href("/")} className={cn(buttonVariants({ size: "lg" }), "rounded-[8px] h-12 px-5 text-base")}>
                {t("system.backHome")}
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
              <Link href={href("/dashboard")} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-[8px] h-12 px-5 text-base")}>
                {t("nav.dashboard")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
