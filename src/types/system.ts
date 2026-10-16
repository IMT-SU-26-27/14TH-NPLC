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
