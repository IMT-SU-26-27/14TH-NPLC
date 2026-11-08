"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { scrollToSection } from "@/lib/home-sections";
import type { SectionLinkProps } from "@/types/landing";

// A link to a homepage section (/id#lomba). On the homepage it always scrolls there, also when the URL already
// has that hash; from any other page it opens the homepage at the section like a normal link.
export function SectionLink({ href, onSectionClick, onClick, ...props }: SectionLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      {...props}
      onClick={(event) => {
        // Decide before the wrapped handler runs: a menu's close handler may mark the click as handled.
        const [path, id] = href.split("#");
        const plainClick = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
        const samePageSection = plainClick && !!id && path === pathname && !!document.getElementById(id);
        if (samePageSection) {
          event.preventDefault();
          if (onSectionClick) onSectionClick(id);
          else scrollToSection(id);
        }
        onClick?.(event);
      }}
    />
  );
}
