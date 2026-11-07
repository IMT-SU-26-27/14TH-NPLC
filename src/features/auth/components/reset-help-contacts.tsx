import { MessageCircleIcon } from "lucide-react";
import { COMMITTEE_CONTACTS, whatsappUrl } from "@/lib/event-info";
import { getT } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { LangProps } from "@/types/i18n";

// Fallback under the reset form: if the email never arrives, the competition's contact person resets the password by hand.
export function ResetHelpContacts({ lang }: LangProps) {
  const t = getT(lang);

  return (
    <div className="space-y-4">
      <Separator />
      <p className="text-muted-foreground text-center text-sm">{t("auth.noResetEmail")}</p>
      <div className="flex flex-col gap-2">
        {COMMITTEE_CONTACTS.map((contact) => (
          <a
            key={contact.whatsapp}
            href={whatsappUrl(contact.whatsapp)}
            target="_blank"
            rel="noopener"
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            <MessageCircleIcon data-icon="inline-start" />
            {`${contact.competition} · ${contact.name}`}
            <span className="sr-only">{` (${t("landing.contact.opensWhatsapp")})`}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
