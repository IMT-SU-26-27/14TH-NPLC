import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/data/auth";
import { homeSectionLinks } from "@/lib/home-sections";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { MobileNav } from "@/components/shared/mobile-nav";
import { UserMenu } from "@/components/shared/user-menu";
import type { LangProps } from "@/types/i18n";
import type { HeaderActionsProps } from "@/types/landing";

async function HeaderActions({ lang, sections }: HeaderActionsProps) {
  const t = getT(lang);
  const user = await getCurrentUser();
  // Guests get sign in / register inside the phone menu, where the header has no room for them.
  const accountLinks = user
    ? []
    : [
        { href: localePath(lang, "/login"), label: t("nav.signIn") },
        { href: localePath(lang, "/signup"), label: t("nav.register") },
      ];

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
          <Link href={localePath(lang, "/login")} className={buttonVariants({ variant: "ghost", className: "max-sm:hidden" })}>
            {t("nav.signIn")}
          </Link>
          <Link href={localePath(lang, "/signup")} className={buttonVariants({ className: "max-sm:hidden" })}>
            {t("nav.register")}
          </Link>
        </>
      )}
      <MobileNav links={sections} accountLinks={accountLinks} />
    </div>
  );
}

export function SiteHeader({ lang }: LangProps) {
  const t = getT(lang);
  const sections = homeSectionLinks(lang);

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
        <nav aria-label={t("footer.navigate")} className="hidden items-center gap-1 lg:flex">
          {sections.map((link) => (
            <Link key={link.href} href={link.href} className={buttonVariants({ variant: "ghost", size: "sm" })}>
              {link.label}
            </Link>
          ))}
        </nav>
        <Suspense fallback={<Skeleton className="h-8 w-48" />}>
          <HeaderActions lang={lang} sections={sections} />
        </Suspense>
      </div>
    </header>
  );
}
