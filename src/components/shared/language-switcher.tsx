"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CheckIcon, LanguagesIcon } from "lucide-react";
import { useRef } from "react";
import { useI18n } from "@/hooks/use-i18n";
import { useLanguagePositionRestore } from "@/hooks/use-language-position-restore";
import { captureLanguagePosition, rememberLanguagePosition } from "@/lib/language-switch";
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

// Switching keeps the visitor's place: the position is saved before leaving and put back on the new page (form
// drafts are saved on the way out by useFormDraft). scroll={false}: Next.js must not jump to the top first.
export function LanguageSwitcher() {
  const { lang, t } = useI18n();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const rest = stripLocale(pathname);
  useLanguagePositionRestore();
  const captured = useRef<ReturnType<typeof captureLanguagePosition> | null>(null);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) captured.current = captureLanguagePosition(lang);
      }}
    >
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" aria-label={t("common.language")} />}>
        <LanguagesIcon />
        {lang.toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("common.language")}</DropdownMenuLabel>
          {LOCALES.map((locale) => (
            <DropdownMenuItem
              key={locale}
              render={
                <Link
                  href={`${localePath(locale, rest)}${search ? `?${search}` : ""}`}
                  scroll={false}
                  onClick={() => {
                    if (locale !== lang) rememberLanguagePosition(captured.current ?? captureLanguagePosition(lang), localePath(locale, rest));
                  }}
                />
              }
            >
              {LOCALE_LABEL[locale]}
              {locale === lang && <CheckIcon className="ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
