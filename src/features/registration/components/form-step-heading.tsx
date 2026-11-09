import type { FormStepHeadingProps } from "@/types/registration";

// Numbered section title inside the registration form. The id is the target of the step links.
export function FormStepHeading({ id, step, title, description }: FormStepHeadingProps) {
  return (
    <div id={id} className="flex scroll-mt-20 gap-3">
      <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-md font-mono text-sm font-semibold">
        {step}
      </span>
      <div className="space-y-0.5">
        <h2 className="text-lg leading-7 font-bold">{title}</h2>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
    </div>
  );
}
