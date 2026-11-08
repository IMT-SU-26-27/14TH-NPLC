// How the current page was opened: "navigate" (link, address bar, new tab), "reload" or "back_forward".
// Only for the document's own URL; a page reached later by a client-side link counts as "navigate".
export function documentNavigationType(): string {
  const [entry] = performance.getEntriesByType("navigation");
  if (!(entry instanceof PerformanceNavigationTiming)) return "navigate";
  const loaded = new URL(entry.name);
  const samePage = loaded.pathname + loaded.search === window.location.pathname + window.location.search;
  return samePage ? entry.type : "navigate";
}
