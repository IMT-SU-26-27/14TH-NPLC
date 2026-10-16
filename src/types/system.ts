export type RouteErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export type CatchAllPageProps = {
  params: Promise<{ lang: string; rest: string[] }>;
};
