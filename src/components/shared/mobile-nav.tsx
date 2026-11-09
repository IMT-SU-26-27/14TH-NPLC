"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { useDismiss } from "@/hooks/use-dismiss";
import { useI18n } from "@/hooks/use-i18n";
import { scrollToSection } from "@/lib/home-sections";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SectionLink } from "@/components/shared/section-link";
import type { MobileNavProps } from "@/types/landing";

// Phone menu, as design "ds-header-menu-mobile": a panel that drops from under the header across the full width,
// the homepage sections numbered 01–05, then Sign in / Register side by side right under the list. The header
// (sticky) is the panel's positioning box. Escape, a press outside, or picking an item closes it.
export function MobileNav({ links, accountLinks }: MobileNavProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const insideRefs = useMemo(() => [triggerRef, panelRef], []);
  useDismiss(open, () => setOpen(false), insideRefs, triggerRef);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="lg:hidden">
      <CollapsibleTrigger
        ref={triggerRef}
        render={
          <Button
            variant={open ? "default" : "outline"}
            size="icon-lg"
            className={cn("rounded-[8px]", !open && "border-primary")}
            aria-label={t(open ? "nav.closeMenu" : "nav.openMenu")}
          />
        }
      >
        {open ? <XIcon /> : <MenuIcon />}
      </CollapsibleTrigger>
      <CollapsibleContent
        ref={panelRef}
        className="bg-background border-primary/40 absolute inset-x-0 top-full border-b-2 px-4 pt-3 pb-5 shadow-[0_16px_32px_-12px] shadow-foreground/25"
      >
        <nav aria-label={t("nav.menu")} className="mx-auto flex max-w-6xl flex-col">
          {links.map((link, i) => (
            <SectionLink
              key={link.href}
              href={link.href}
              // On the homepage the panel just closes and the page scrolls; elsewhere the link opens the homepage.
              onSectionClick={(id) => {
                setOpen(false);
                scrollToSection(id);
              }}
              onClick={() => setOpen(false)}
              className="font-heading text-foreground hover:text-primary focus-visible:ring-ring/50 flex h-12 items-center gap-3.5 border-b px-1 text-lg font-semibold outline-none focus-visible:ring-3"
            >
              <span className="text-primary w-6 font-mono text-xs font-medium tracking-[0.14em]">{String(i + 1).padStart(2, "0")}</span>
              {link.label}
            </SectionLink>
          ))}
          {accountLinks.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {accountLinks.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants({ variant: i === 0 ? "outline" : "default", size: "lg" }), "h-12 rounded-[8px]", i === 0 && "border-primary")}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </CollapsibleContent>
    </Collapsible>
  );
}
