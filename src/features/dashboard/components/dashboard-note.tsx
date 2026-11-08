import type { DashboardNoteProps } from "@/types/registration";

// The dashboard's note style (design 07 "Satu akun, satu lomba"): an icon in a purple circle on a soft purple card.
export function DashboardNote({ icon: Icon, title, description }: DashboardNoteProps) {
  return (
    <section className="bg-brand-purple/10 ring-primary/45 flex gap-4 rounded-[12px] p-6 ring-1 sm:p-7">
      <span className="bg-brand-purple text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
        <Icon aria-hidden className="size-[18px]" />
      </span>
      <div className="space-y-0.5 self-center text-sm">
        {title && <h2 className="font-medium">{title}</h2>}
        <p className={title ? "text-muted-foreground" : "font-medium"}>{description}</p>
      </div>
    </section>
  );
}
