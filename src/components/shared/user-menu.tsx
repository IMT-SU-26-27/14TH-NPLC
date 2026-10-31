"use client";

import Link from "next/link";
import { LayoutDashboardIcon, LogOutIcon, MapPinIcon, ShieldIcon, UserRoundIcon, UsersIcon } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
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

export function UserMenu({ user }: UserMenuProps) {
  const { t, href } = useI18n();
  const name = user.full_name || user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>{name.split(" ")[0]}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block truncate">{name}</span>
            <span className="text-muted-foreground block truncate text-xs font-normal">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {user.role === "lo" ? (
          <DropdownMenuItem render={<Link href={href("/lo")} />}>
            <MapPinIcon />
            {t("nav.loPosts")}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem render={<Link href={href("/dashboard")} />}>
            <LayoutDashboardIcon />
            {t("nav.dashboard")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem render={<Link href={href("/profile")} />}>
          <UserRoundIcon />
          {t("nav.profile")}
        </DropdownMenuItem>
        {user.role !== "lo" && (
          <DropdownMenuItem render={<Link href={href("/join")} />}>
            <UsersIcon />
            {t("nav.joinTeam")}
          </DropdownMenuItem>
        )}
        {user.role === "admin" && (
          <DropdownMenuItem render={<Link href={href("/admin")} />}>
            <ShieldIcon />
            {t("nav.admin")}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
          <LogOutIcon />
          {t("nav.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
