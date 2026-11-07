import Link from "next/link";
import { getCurrentUser } from "@/lib/data/auth";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { buttonVariants } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { MobileNav } from "@/components/shared/mobile-nav";
import { UserMenu } from "@/components/shared/user-menu";
import type { HeaderActionsProps } from "@/types/landing";

// Reads the session, so the header renders it inside <Suspense>.
// Guests get the Home section links (desktop and phone menu); signed-in users get only their account links,
// as in the design: logo · language · dashboard (· admin) · user menu. The user menu covers the phone.
export async function HeaderActions({ lang, sections }: HeaderActionsProps) {
  const t = getT(lang);
  const user = await getCurrentUser();

  if (user) {
    return (
      <div className="flex items-center gap-1">
        <LanguageSwitcher />
        <Link href={localePath(lang, user.role === "lo" ? "/lo" : "/dashboard")} className={buttonVariants({ variant: "ghost", className: "max-sm:hidden" })}>
          {t(user.role === "lo" ? "nav.loPosts" : "nav.dashboard")}
        </Link>
        {user.role === "admin" && (
          <Link href={localePath(lang, "/admin")} className={buttonVariants({ variant: "ghost", className: "max-sm:hidden" })}>
            {t("nav.admin")}
          </Link>
        )}
        <UserMenu user={user} />
      </div>
    );
  }

  // Sign in / register also sit inside the phone menu, where the header has no room for them.
  const accountLinks = [
    { href: localePath(lang, "/login"), label: t("nav.signIn") },
    { href: localePath(lang, "/signup"), label: t("nav.register") },
  ];

  return (
    <>
      <nav aria-label={t("footer.navigate")} className="hidden items-center gap-1 lg:flex">
        {sections.map((link) => (
          <Link key={link.href} href={link.href} className={buttonVariants({ variant: "ghost", size: "sm" })}>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-1">
        <LanguageSwitcher />
        <Link href={localePath(lang, "/login")} className={buttonVariants({ variant: "ghost", className: "max-sm:hidden" })}>
          {t("nav.signIn")}
        </Link>
        <Link href={localePath(lang, "/signup")} className={buttonVariants({ className: "max-sm:hidden" })}>
          {t("nav.register")}
        </Link>
        <MobileNav links={sections} accountLinks={accountLinks} />
      </div>
    </>
  );
}
