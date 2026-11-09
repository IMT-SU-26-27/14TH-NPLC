import { contactFor, whatsappUrl } from "@/lib/event-info";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/shared/whatsapp-icon";
import type { ContactPersonLinkProps } from "@/types/landing";

// WhatsApp button to the contact person of one competition, e.g. "Rally · 0895-0667-7376 · Caca".
// On a narrow phone the text wraps at the separators, never inside the number, so the button stays inside its card.
export function ContactPersonLink({ competitionType, opensLabel, className }: ContactPersonLinkProps) {
  const contact = contactFor(competitionType);
  if (!contact) return null;

  return (
    <a
      href={whatsappUrl(contact.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "outline" }), "h-auto min-h-8 max-w-full py-1.5 text-left whitespace-normal tabular-nums", className)}
    >
      <WhatsappIcon data-icon="inline-start" />
      <span className="flex min-w-0 flex-wrap items-center gap-x-1">
        <span className="whitespace-nowrap">{`${contact.label} ·`}</span>
        <span className="whitespace-nowrap">{`${contact.display} ·`}</span>
        <span className="whitespace-nowrap">{contact.name}</span>
      </span>
      <span className="sr-only">{` (${opensLabel})`}</span>
    </a>
  );
}
