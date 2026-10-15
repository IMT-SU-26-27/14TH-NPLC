"use client";

import { CheckIcon, CopyIcon, LinkIcon } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ReferralCodeProps } from "@/types/registration";

export function ReferralCode({ code }: ReferralCodeProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <Field>
      <FieldLabel htmlFor={`code-${code}`}>Team code</FieldLabel>
      <div className="flex gap-2">
        <Input id={`code-${code}`} value={code} readOnly className="font-mono tracking-widest" />
        <Button type="button" variant="outline" size="icon" aria-label="Copy code" onClick={() => copy(code, "Team code copied")}>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => copy(`${window.location.origin}/join?code=${code}`, "Invite link copied")}
        >
          <LinkIcon />
          Invite link
        </Button>
      </div>
      <FieldDescription>Teammates sign in and enter this code on the Join a team page.</FieldDescription>
    </Field>
  );
}
