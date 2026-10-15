"use client";

import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RegistrationFiltersFormProps } from "@/types/admin";

// GET form: filters live in the URL, so results are shareable and survive refresh.
export function RegistrationFilters({ filters, competitions }: RegistrationFiltersFormProps) {
  const { t, href } = useI18n();
  const competitionItems = [
    { value: "all", label: t("admin.registrations.allCompetitions") },
    ...competitions.map((c) => ({ value: c.id, label: c.name })),
  ];
  const statusItems = [
    { value: "all", label: t("admin.registrations.allStatuses") },
    ...(["pending_payment", "under_review", "accepted", "rejected"] as const).map((s) => ({ value: s, label: t(`status.${s}`) })),
  ];

  return (
    <form method="get" className="grid gap-3 md:grid-cols-[1fr_14rem_12rem_auto] md:items-end">
      <Field>
        <FieldLabel htmlFor="q">{t("admin.registrations.search")}</FieldLabel>
        <Input id="q" name="q" defaultValue={filters.q} placeholder={t("admin.registrations.searchPlaceholder")} />
      </Field>
      <Field>
        <FieldLabel>{t("admin.registrations.competition")}</FieldLabel>
        <Select name="competition" items={competitionItems} defaultValue={filters.competition ?? "all"}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {competitionItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>{t("admin.registrations.status")}</FieldLabel>
        <Select name="status" items={statusItems} defaultValue={filters.status ?? "all"}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="flex gap-2">
        <Button type="submit">
          <SearchIcon />
          {t("admin.registrations.apply")}
        </Button>
        <Link href={href("/admin/registrations")} className={buttonVariants({ variant: "ghost" })}>
          {t("admin.registrations.reset")}
        </Link>
      </div>
    </form>
  );
}
