"use client";

import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { MobileNavProps } from "@/types/landing";

// Phone menu: the homepage sections, numbered like the Figma mobile frame.
export function MobileNav({ links, accountLinks }: MobileNavProps) {
  const { t } = useI18n();

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="icon-lg" className="border-primary lg:hidden" aria-label={t("nav.openMenu")} />}>
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{t("nav.menu")}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-2">
          {links.map((link, i) => (
            <SheetClose
              key={link.href}
              render={<Link href={link.href} className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "justify-start gap-3")} />}
            >
              <span className="text-primary font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
              {link.label}
            </SheetClose>
          ))}
        </nav>
        {accountLinks.length > 0 && (
          <SheetFooter className="grid grid-cols-2">
            {accountLinks.map((link, i) => (
              <SheetClose
                key={link.href}
                render={<Link href={link.href} className={buttonVariants({ variant: i === 0 ? "outline" : "default", size: "lg" })} />}
              >
                {link.label}
              </SheetClose>
            ))}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
