"use client";

import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RallyFiltersFormProps } from "@/types/rally";

// GET form: filters live in the URL, so they survive a refresh and can be shared.
export function RallyFiltersForm({ filters, posts, resetHref }: RallyFiltersFormProps) {
  const { t } = useI18n();
  const items = [{ value: "all", label: t("rally.results.allPosts") }, ...posts.map((p) => ({ value: p.id, label: p.name }))];

  return (
    <form method="get" className="grid gap-3 md:grid-cols-[1fr_16rem_auto] md:items-end">
      {filters.team && <input type="hidden" name="team" value={filters.team} />}
      <Field>
        <FieldLabel htmlFor="q">{t("rally.results.searchTeam")}</FieldLabel>
        <Input id="q" name="q" className="bg-card" defaultValue={filters.q} />
      </Field>
      <Field>
        <FieldLabel>{t("rally.results.post")}</FieldLabel>
        <Select name="post" items={items} defaultValue={filters.post ?? "all"}>
          <SelectTrigger className="bg-card w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
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
        <Link href={resetHref} className={buttonVariants({ variant: "ghost" })}>
          {t("admin.registrations.reset")}
        </Link>
      </div>
    </form>
  );
}
