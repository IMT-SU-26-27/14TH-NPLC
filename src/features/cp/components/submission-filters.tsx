"use client";

import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { CP_VERDICTS } from "@/lib/validations/cp";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SubmissionFiltersFormProps } from "@/types/cp";

// GET form: filters live in the URL, so a filtered list can be shared with another admin.
export function SubmissionFilters({ filters, competitionId, problems }: SubmissionFiltersFormProps) {
  const { t, href } = useI18n();
  const problemItems = [
    { value: "all", label: t("admin.submissions.allProblems") },
    ...problems.map((p) => ({ value: p.id, label: `${p.level}. ${p.title}` })),
  ];
  const verdictItems = [
    { value: "all", label: t("admin.submissions.allVerdicts") },
    ...CP_VERDICTS.map((v) => ({ value: v, label: t(`cp.verdict.${v}.title`) })),
  ];

  return (
    <form method="get" className="grid gap-3 md:grid-cols-[1fr_14rem_14rem_auto] md:items-end">
      <input type="hidden" name="competition" value={competitionId} />
      {filters.team && <input type="hidden" name="team" value={filters.team} />}
      <Field>
        <FieldLabel htmlFor="q">{t("admin.submissions.searchTeam")}</FieldLabel>
        <Input id="q" name="q" className="bg-card" defaultValue={filters.q} placeholder={t("admin.submissions.searchPlaceholder")} />
      </Field>
      <Field>
        <FieldLabel htmlFor="problem">{t("admin.submissions.problem")}</FieldLabel>
        <Select name="problem" items={problemItems} defaultValue={filters.problem ?? "all"}>
          <SelectTrigger id="problem" className="bg-card w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {problemItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="verdict">{t("admin.submissions.verdict")}</FieldLabel>
        <Select name="verdict" items={verdictItems} defaultValue={filters.verdict ?? "all"}>
          <SelectTrigger id="verdict" className="bg-card w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {verdictItems.map((item) => (
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
        <Link href={`${href("/admin/cp/submissions")}?competition=${competitionId}`} className={buttonVariants({ variant: "ghost" })}>
          {t("admin.registrations.reset")}
        </Link>
      </div>
    </form>
  );
}
