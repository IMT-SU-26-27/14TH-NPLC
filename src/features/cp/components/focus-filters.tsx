"use client";

import Link from "next/link";
import { ListFilterIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { formatDuration } from "@/lib/format";
import { CP_FOCUS_KINDS, CP_FOCUS_MIN_SECONDS } from "@/lib/validations/cp";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FocusFiltersFormProps } from "@/types/cp";

// GET form: filters live in the URL, so a filtered view can be shared with another admin.
export function FocusFilters({ filters, competitionId }: FocusFiltersFormProps) {
  const { t, href, lang } = useI18n();
  const kindItems = [
    { value: "all", label: t("admin.focus.allKinds") },
    ...CP_FOCUS_KINDS.map((k) => ({ value: k, label: t(`cp.focus.kind.${k}`) })),
  ];
  const minItems = CP_FOCUS_MIN_SECONDS.map((s) => ({
    value: String(s),
    label: s === 0 ? t("admin.focus.anyLength") : t("admin.focus.atLeast", { duration: formatDuration(s, lang) }),
  }));
  const resetHref = `${href("/admin/cp/activity")}?competition=${competitionId}${filters.team ? `&team=${filters.team}` : ""}`;

  return (
    <form method="get" className="grid gap-3 sm:grid-cols-[14rem_14rem_auto] sm:items-end">
      <input type="hidden" name="competition" value={competitionId} />
      {filters.team && <input type="hidden" name="team" value={filters.team} />}
      <Field>
        <FieldLabel htmlFor="kind">{t("admin.focus.kind")}</FieldLabel>
        <Select name="kind" items={kindItems} defaultValue={filters.kind ?? "all"}>
          <SelectTrigger id="kind" className="bg-card w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {kindItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="min">{t("admin.focus.minLength")}</FieldLabel>
        <Select name="min" items={minItems} defaultValue={String(filters.min)}>
          <SelectTrigger id="min" className="bg-card w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {minItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="flex gap-2">
        <Button type="submit">
          <ListFilterIcon />
          {t("admin.registrations.apply")}
        </Button>
        <Link href={resetHref} className={buttonVariants({ variant: "ghost" })}>
          {t("admin.registrations.reset")}
        </Link>
      </div>
    </form>
  );
}
