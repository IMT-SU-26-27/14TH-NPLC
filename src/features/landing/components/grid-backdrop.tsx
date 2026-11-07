// Faint blueprint grid behind the dark navy sections. Decorative only.
export function GridBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--background)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--background)_6%,transparent)_1px,transparent_1px)] bg-size-[48px_48px]"
    />
  );
}
