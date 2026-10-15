import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { JoinCodeFormProps } from "@/types/registration";

// Plain GET form: the code ends up in ?code= and the page shows the team preview.
export function JoinCodeForm({ defaultCode }: JoinCodeFormProps) {
  return (
    <form action="/join" method="get">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="code">Team code</FieldLabel>
          <Input
            id="code"
            name="code"
            defaultValue={defaultCode}
            placeholder="e.g. GDYFUVQM"
            maxLength={8}
            autoComplete="off"
            className="font-mono tracking-widest uppercase"
            required
          />
          <FieldDescription>Ask your team leader for the 8-character code on their dashboard.</FieldDescription>
        </Field>
        <Button type="submit">
          Find team
          <ArrowRightIcon />
        </Button>
      </FieldGroup>
    </form>
  );
}
