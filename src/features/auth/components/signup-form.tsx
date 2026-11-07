"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRightIcon, LockIcon, MailIcon, OctagonXIcon, UserIcon } from "lucide-react";
import { signUp } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/form";
import { formatTimeOfDay } from "@/lib/format";
import { useFormDraft } from "@/hooks/use-form-draft";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { FormDraftBanner } from "@/components/shared/form-draft-banner";
import type { AuthFormProps } from "@/types/auth";

const labelClass = "text-primary font-mono text-xs font-medium tracking-[0.2em] uppercase";
const requiredMark = (
  <span aria-hidden className="text-destructive">
    *
  </span>
);

export function SignupForm({ next }: AuthFormProps) {
  // No account yet, so the draft belongs to this device. Passwords are never saved.
  const { formRef, restored: draftRestored, savedAt: draftSavedAt, discardDraft, clearOnSuccess } = useFormDraft({ formId: "signup", userId: "guest" });
  const [state, action, pending] = useActionState(clearOnSuccess(signUp), initialFormState);
  const { t, lang, href, fieldErrors } = useI18n();
  const errors = state.fieldErrors ?? {};

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="next" value={next ?? "/dashboard"} />
      <FieldGroup>
        {draftRestored && <FormDraftBanner onDiscard={discardDraft} />}
        <Field data-invalid={!!errors.fullName}>
          <FieldLabel htmlFor="fullName" className={labelClass}>
            {t("common.fullName")} {requiredMark}
          </FieldLabel>
          <InputGroup className="h-12">
            <InputGroupAddon>
              <UserIcon />
            </InputGroupAddon>
            <InputGroupInput id="fullName" name="fullName" autoComplete="name" aria-invalid={!!errors.fullName} required />
          </InputGroup>
          <FieldError errors={fieldErrors(errors.fullName)} />
        </Field>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email" className={labelClass}>
            {t("common.email")} {requiredMark}
          </FieldLabel>
          <InputGroup className="h-12">
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
            <InputGroupInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t("auth.emailPlaceholder")}
              aria-invalid={!!errors.email}
              required
            />
          </InputGroup>
          <FieldError errors={fieldErrors(errors.email)} />
        </Field>
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password" className={labelClass}>
            {t("auth.password")} {requiredMark}
          </FieldLabel>
          <InputGroup className="h-12">
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
            <InputGroupInput id="password" name="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} required />
          </InputGroup>
          <FieldDescription>{t("auth.passwordHint")}</FieldDescription>
          <FieldError errors={fieldErrors(errors.password)} />
        </Field>
        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword" className={labelClass}>
            {t("auth.confirmPassword")} {requiredMark}
          </FieldLabel>
          <InputGroup className="h-12">
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
            <InputGroupInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              required
            />
          </InputGroup>
          <FieldError errors={fieldErrors(errors.confirmPassword)} />
        </Field>
        {state.status === "error" && state.message && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{t(state.message)}</AlertDescription>
          </Alert>
        )}
        <Field>
          <Button type="submit" size="lg" className="h-12 text-base" disabled={pending}>
            {pending && <Spinner />}
            {t("auth.createAccount")}
            {!pending && <ArrowRightIcon />}
          </Button>
          {draftSavedAt !== null && (
            <p className="text-muted-foreground flex items-center gap-2 font-mono text-xs tracking-[0.15em] uppercase">
              <span aria-hidden className="bg-success size-2 shrink-0 rounded-full" />
              {t("draft.savedNoPassword", { time: formatTimeOfDay(draftSavedAt, lang) })}
            </p>
          )}
          <FieldDescription>
            {t("auth.haveAccount")}{" "}
            <Link href={next ? `${href("/login")}?next=${encodeURIComponent(next)}` : href("/login")}>{t("auth.signIn")}</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
