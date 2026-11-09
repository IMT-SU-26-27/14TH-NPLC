"use client";

import { useActionState, useState } from "react";
import { OctagonXIcon } from "lucide-react";
import { saveRallyPost } from "@/lib/actions/admin-rally";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import type { RallyPostFormProps } from "@/types/rally";

export function RallyPostForm({ post, loAccounts }: RallyPostFormProps) {
  const [state, action, pending] = useActionState(saveRallyPost, initialFormState);
  const { t, fieldErrors } = useI18n();
  const [allowDraw, setAllowDraw] = useState(post?.allow_draw ?? false);
  const errors = state.fieldErrors ?? {};
  const kinds = (["physical", "digital"] as const).map((value) => ({ value, label: t(`rally.kind.${value}`) }));
  const assigned = new Set(post?.assignments.flatMap((a) => (a.lo ? [a.lo.id] : [])));

  return (
    <form action={action}>
      {post && <input type="hidden" name="id" value={post.id} />}
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">{t("rally.admin.postName")}</FieldLabel>
          <Input id="name" name="name" maxLength={80} defaultValue={post?.name} aria-invalid={!!errors.name} required />
          <FieldError errors={fieldErrors(errors.name)} />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel>{t("rally.admin.kind")}</FieldLabel>
            <Select name="kind" items={kinds} defaultValue={post?.kind ?? "physical"}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {kinds.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field data-invalid={!!errors.location}>
            <FieldLabel htmlFor="location">{t("rally.admin.location")}</FieldLabel>
            <Input id="location" name="location" maxLength={120} defaultValue={post?.location ?? ""} aria-invalid={!!errors.location} />
            <FieldError errors={fieldErrors(errors.location)} />
          </Field>
        </div>

        <FieldSet>
          <FieldLegend>{t("rally.admin.pointsTitle")}</FieldLegend>
          <FieldDescription>{t("rally.admin.pointsLead")}</FieldDescription>
          <div className="grid gap-6 sm:grid-cols-3">
            <Field data-invalid={!!errors.pointsWin}>
              <FieldLabel htmlFor="pointsWin">{t("rally.admin.pointsWin")}</FieldLabel>
              <Input id="pointsWin" name="pointsWin" type="number" min={0} defaultValue={post?.points_win ?? 100} aria-invalid={!!errors.pointsWin} required />
              <FieldError errors={fieldErrors(errors.pointsWin)} />
            </Field>
            <Field data-invalid={!!errors.pointsLose}>
              <FieldLabel htmlFor="pointsLose">{t("rally.admin.pointsLose")}</FieldLabel>
              <Input id="pointsLose" name="pointsLose" type="number" min={0} defaultValue={post?.points_lose ?? 25} aria-invalid={!!errors.pointsLose} required />
              <FieldError errors={fieldErrors(errors.pointsLose)} />
            </Field>
            <Field data-invalid={!!errors.pointsDraw}>
              <FieldLabel htmlFor="pointsDraw">{t("rally.admin.pointsDraw")}</FieldLabel>
              {/* Kept while draws are off, so switching them back on doesn't lose the value. */}
              <Input id="pointsDraw" name="pointsDraw" type="number" min={0} defaultValue={post?.points_draw ?? 50} readOnly={!allowDraw} aria-invalid={!!errors.pointsDraw} required />
              <FieldError errors={fieldErrors(errors.pointsDraw)} />
            </Field>
          </div>
        </FieldSet>

        <Field orientation="horizontal">
          <Switch id="allowDraw" name="allowDraw" checked={allowDraw} onCheckedChange={setAllowDraw} />
          <FieldContent>
            <FieldLabel htmlFor="allowDraw">{t("rally.admin.allowDraw")}</FieldLabel>
            <FieldDescription>{t("rally.admin.allowDrawHint")}</FieldDescription>
          </FieldContent>
        </Field>

        <FieldSet>
          <FieldLegend>{t("rally.admin.los")}</FieldLegend>
          <FieldDescription>{t(loAccounts.length > 0 ? "rally.admin.losLead" : "rally.admin.noLoAccounts")}</FieldDescription>
          <FieldGroup className="gap-3">
            {loAccounts.map((lo) => (
              <Field key={lo.id} orientation="horizontal">
                <Checkbox id={`lo-${lo.id}`} name="loIds" value={lo.id} defaultChecked={assigned.has(lo.id)} />
                <FieldLabel htmlFor={`lo-${lo.id}`} className="font-normal">
                  {lo.full_name} <span className="text-muted-foreground">· {lo.email}</span>
                </FieldLabel>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>

        <Field orientation="horizontal">
          <Switch id="isActive" name="isActive" defaultChecked={post?.is_active ?? true} />
          <FieldContent>
            <FieldLabel htmlFor="isActive">{t("rally.admin.active")}</FieldLabel>
            <FieldDescription>{t("rally.admin.activeHint")}</FieldDescription>
          </FieldContent>
        </Field>

        {state.status === "error" && state.message && !state.fieldErrors && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{t(state.message)}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={pending} className="sm:w-fit">
          {pending && <Spinner />}
          {t("common.save")}
        </Button>
      </FieldGroup>
    </form>
  );
}
