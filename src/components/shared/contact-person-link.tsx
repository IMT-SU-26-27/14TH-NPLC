import { contactFor, whatsappUrl } from "@/lib/event-info";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/shared/whatsapp-icon";
import type { ContactPersonLinkProps } from "@/types/landing";

// WhatsApp button to the contact person of one competition, e.g. "Rally · 0895-0667-7376 · Caca".
export function ContactPersonLink({ competitionType, opensLabel, className }: ContactPersonLinkProps) {
  const contact = contactFor(competitionType);
  if (!contact) return null;

  return (
    <a
      href={whatsappUrl(contact.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "outline" }), "tabular-nums", className)}
    >
      <WhatsappIcon data-icon="inline-start" />
      {`${contact.label} · ${contact.display} · ${contact.name}`}
      <span className="sr-only">{` (${opensLabel})`}</span>
    </a>
  );
}
