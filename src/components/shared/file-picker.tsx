"use client";

import { useState } from "react";
import { FileCheckIcon, UploadIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { FilePickerProps } from "@/types/registration";

// A translated "Pick file" drop area in place of the browser's own "Choose File / No file chosen",
// which shows in the browser's language. The real input stays focusable (sr-only) for keyboards and labels.
export function FilePicker({ id, accept, disabled, invalid, onFileChange }: FilePickerProps) {
  const { t } = useI18n();
  const [name, setName] = useState<string | null>(null);

  return (
    <div>
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        aria-invalid={invalid}
        className="peer sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          setName(file?.name ?? null);
          onFileChange(file);
        }}
      />
      <label
        htmlFor={id}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "border-primary/40 h-auto w-full cursor-pointer justify-start border-dashed py-3 whitespace-normal",
          "peer-focus-visible:border-ring peer-focus-visible:ring-ring/50 peer-focus-visible:ring-3",
          "peer-aria-invalid:border-destructive peer-disabled:pointer-events-none peer-disabled:opacity-50",
          name && "border-primary border-solid",
        )}
      >
        {name ? <FileCheckIcon className="text-primary" /> : <UploadIcon />}
        <span className="min-w-0 truncate font-medium">{name ?? t("payment.pickFile")}</span>
      </label>
    </div>
  );
}
