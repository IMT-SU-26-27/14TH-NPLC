import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/data/auth";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { UserMenu } from "@/components/shared/user-menu";
import type { LangProps } from "@/types/i18n";

async function HeaderActions({ lang }: LangProps) {
  const t = getT(lang);
  const user = await getCurrentUser();

  return (
    <div className="flex items-center gap-1">
      <LanguageSwitcher />
      {user ? (
        <>
          <Link href={localePath(lang, "/dashboard")} className={buttonVariants({ variant: "ghost", className: "max-sm:hidden" })}>
            {t("nav.dashboard")}
          </Link>
          {user.role === "admin" && (
            <Link href={localePath(lang, "/admin")} className={buttonVariants({ variant: "ghost", className: "max-sm:hidden" })}>
              {t("nav.admin")}
            </Link>
          )}
          <UserMenu user={user} />
        </>
      ) : (
        <>
          <Link href={localePath(lang, "/login")} className={buttonVariants({ variant: "ghost" })}>
            {t("nav.signIn")}
          </Link>
          <Link href={localePath(lang, "/signup")} className={buttonVariants()}>
            {t("nav.register")}
          </Link>
        </>
      )}
    </div>
  );
}

export function SiteHeader({ lang }: LangProps) {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href={localePath(lang, "/")} className="font-heading font-semibold tracking-tight">
          14th NPLC
        </Link>
        <Suspense fallback={<Skeleton className="h-8 w-48" />}>
          <HeaderActions lang={lang} />
        </Suspense>
      </div>
    </header>
  );
}
