"use client";

import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

// not-found.tsx receives no params, so the language comes from the I18nProvider in the layout.
export function NotFoundView() {
  const { t, href } = useI18n();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestionIcon />
          </EmptyMedia>
          <EmptyTitle>{t("system.notFoundTitle")}</EmptyTitle>
          <EmptyDescription>{t("system.notFoundDescription")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Link href={href("/")} className={buttonVariants()}>
            {t("system.backHome")}
          </Link>
          <Link href={href("/dashboard")} className={buttonVariants({ variant: "outline" })}>
            {t("nav.dashboard")}
          </Link>
        </EmptyContent>
      </Empty>
    </main>
  );
}
