"use client";

import Link from "next/link";
import { LayoutDashboardIcon, LogOutIcon, MapPinIcon, MenuIcon, ShieldIcon, UserRoundIcon } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { removeAllDrafts } from "@/lib/form-draft";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserMenuProps } from "@/types/auth";

const ROLE_LABEL = { participant: "nav.roleParticipant", admin: "nav.roleAdmin", lo: "nav.roleLo" } as const;

// The account menu (☰) of the site header: name and role, Dashboard (phones only; the header shows it on wider
// screens), Profile, Admin for admins, then Sign out.
export function UserMenu({ user }: UserMenuProps) {
  const { t, href } = useI18n();
  const name = user.full_name || user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-lg" aria-label={t("nav.accountMenu")} />}
      >
        <MenuIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block truncate">{name}</span>
            <span className="text-muted-foreground block truncate text-xs font-normal">{t(ROLE_LABEL[user.role])}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {user.role === "lo" ? (
          <DropdownMenuItem className="sm:hidden" render={<Link href={href("/lo")} />}>
            <MapPinIcon />
            {t("nav.loPosts")}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem className="sm:hidden" render={<Link href={href("/dashboard")} />}>
            <LayoutDashboardIcon />
            {t("nav.dashboard")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem render={<Link href={href("/profile")} />}>
          <UserRoundIcon />
          {t("nav.profile")}
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem render={<Link href={href("/admin")} />}>
            <ShieldIcon />
            {t("nav.admin")}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => {
            // Form drafts hold personal data (name, NISN, phone), so a shared device keeps none after sign-out.
            removeAllDrafts();
            signOut();
          }}
        >
          <LogOutIcon />
          {t("nav.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
