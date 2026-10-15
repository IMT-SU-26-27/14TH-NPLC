"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CheckIcon, LanguagesIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { LOCALE_LABEL, LOCALES, localePath, stripLocale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { lang, t } = useI18n();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const rest = stripLocale(pathname);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" aria-label={t("common.language")} />}>
        <LanguagesIcon />
        {lang.toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("common.language")}</DropdownMenuLabel>
          {LOCALES.map((locale) => (
            <DropdownMenuItem key={locale} render={<Link href={`${localePath(locale, rest)}${search ? `?${search}` : ""}`} />}>
              {LOCALE_LABEL[locale]}
              {locale === lang && <CheckIcon className="ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
