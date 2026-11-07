// The navy bands' 48px grid (--band-grid in globals.css, shared with PageBand). Decorative only.
export function GridBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 [background:var(--band-grid)]"
    />
  );
}
