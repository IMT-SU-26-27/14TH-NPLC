"use client";

import { useActionState } from "react";
import Link from "next/link";
import { OctagonXIcon } from "lucide-react";
import { signIn } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { AuthFormProps } from "@/types/auth";

export function LoginForm({ next }: AuthFormProps) {
  const [state, action, pending] = useActionState(signIn, initialFormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action}>
      <input type="hidden" name="next" value={next ?? "/dashboard"} />
      <FieldGroup>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} required />
          <FieldError errors={errors.email} />
        </Field>
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" name="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} required />
          <FieldError errors={errors.password} />
        </Field>
        {state.status === "error" && state.message && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        <Field>
          <Button type="submit" size="lg" disabled={pending}>
            {pending && <Spinner />}
            Sign in
          </Button>
          <FieldDescription className="text-center">
            No account yet? <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}>Create one</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
