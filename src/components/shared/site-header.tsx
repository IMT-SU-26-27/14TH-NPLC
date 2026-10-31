import { Suspense } from "react";
import Image from "next/image";
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
          <Link href={localePath(lang, user.role === "lo" ? "/lo" : "/dashboard")} className={buttonVariants({ variant: "ghost", className: "max-sm:hidden" })}>
            {t(user.role === "lo" ? "nav.loPosts" : "nav.dashboard")}
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
  const t = getT(lang);

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 min-[360px]:gap-4">
        <Link href={localePath(lang, "/")} className="shrink-0">
          <Image
            src="/shared/logo-nplc-xiv.webp"
            alt={t("meta.siteName")}
            width={128}
            height={26}
            preload
            className="h-5 w-auto min-[360px]:h-6.5"
          />
        </Link>
        <Suspense fallback={<Skeleton className="h-8 w-48" />}>
          <HeaderActions lang={lang} />
        </Suspense>
      </div>
    </header>
  );
}
