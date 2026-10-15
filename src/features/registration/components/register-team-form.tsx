"use client";

import { useActionState } from "react";
import { OctagonXIcon } from "lucide-react";
import { createRegistration } from "@/lib/actions/registration";
import { initialFormState } from "@/lib/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { RegisterTeamFormProps } from "@/types/registration";

export function RegisterTeamForm({ competition, user }: RegisterTeamFormProps) {
  const [state, action, pending] = useActionState(createRegistration, initialFormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action}>
      <input type="hidden" name="competitionId" value={competition.id} />
      <FieldGroup>
        <Field data-invalid={!!errors.teamName}>
          <FieldLabel htmlFor="teamName">Team name</FieldLabel>
          <Input id="teamName" name="teamName" maxLength={60} aria-invalid={!!errors.teamName} required />
          <FieldDescription>Can&apos;t be changed after the team is created.</FieldDescription>
          <FieldError errors={errors.teamName} />
        </Field>

        <FieldSet>
          <FieldLegend>Team leader</FieldLegend>
          <FieldDescription>That&apos;s you. Teammates join later with your team code.</FieldDescription>
          <FieldGroup>
            <Field data-invalid={!!errors.leaderName}>
              <FieldLabel htmlFor="leaderName">Full name</FieldLabel>
              <Input id="leaderName" name="leaderName" defaultValue={user.full_name} autoComplete="name" aria-invalid={!!errors.leaderName} required />
              <FieldError errors={errors.leaderName} />
            </Field>
            <Field>
              <FieldLabel htmlFor="leaderEmail">Email</FieldLabel>
              <Input id="leaderEmail" value={user.email} disabled readOnly />
              <FieldDescription>From your account.</FieldDescription>
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field data-invalid={!!errors.leaderPhone}>
                <FieldLabel htmlFor="leaderPhone">Phone (WhatsApp)</FieldLabel>
                <Input id="leaderPhone" name="leaderPhone" type="tel" inputMode="tel" placeholder="081234567890" autoComplete="tel" aria-invalid={!!errors.leaderPhone} required />
                <FieldError errors={errors.leaderPhone} />
              </Field>
              <Field data-invalid={!!errors.leaderNisn}>
                <FieldLabel htmlFor="leaderNisn">NISN</FieldLabel>
                <Input id="leaderNisn" name="leaderNisn" inputMode="numeric" maxLength={10} placeholder="10 digits" aria-invalid={!!errors.leaderNisn} required />
                <FieldError errors={errors.leaderNisn} />
              </Field>
            </div>
          </FieldGroup>
        </FieldSet>

        {state.status === "error" && state.message && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" disabled={pending}>
          {pending && <Spinner />}
          Create team
        </Button>
      </FieldGroup>
    </form>
  );
}
