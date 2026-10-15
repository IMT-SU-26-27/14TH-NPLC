"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/hooks/use-i18n";
import { stripLocale } from "@/lib/i18n/config";
import { buttonVariants } from "@/components/ui/button";

const LINKS = [
  { href: "/admin", key: "admin.nav.overview" },
  { href: "/admin/registrations", key: "admin.nav.registrations" },
  { href: "/admin/competitions", key: "admin.nav.competitions" },
  { href: "/admin/cp", key: "admin.nav.contest" },
  { href: "/admin/content", key: "admin.nav.content" },
];

export function AdminNav() {
  const { t, href } = useI18n();
  const pathname = stripLocale(usePathname());

  return (
    <nav className="flex flex-wrap gap-1 border-b pb-2">
      {LINKS.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={href(link.href)}
            aria-current={active ? "page" : undefined}
            className={buttonVariants({ variant: active ? "secondary" : "ghost", className: "shrink-0" })}
          >
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}
