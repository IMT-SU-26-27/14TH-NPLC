export type RouteErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
  // Where the secondary button leads; the admin boundary points it back to /admin.
  homeHref?: string;
  homeLabel?: string;
};

export type CatchAllPageProps = {
  params: Promise<{ lang: string; rest: string[] }>;
};

export type RefreshOnFocus = {
  // Re-render the page with fresh server data now.
  refresh: () => void;
  pending: boolean;
};

export type RefreshButtonProps = {
  className?: string;
};
