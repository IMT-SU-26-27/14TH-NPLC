// The public origin of the current request.
//
// `request.nextUrl.origin` cannot be used behind the reverse proxy: Next's
// standalone server builds it from the address it binds to (HOSTNAME=0.0.0.0,
// PORT=3000), so it yields "https://0.0.0.0:3000" and every redirect built from
// it is unreachable. The Host header carries the real public hostname.
export function originFromHeaders(source: { get(name: string): string | null }): string {
  const host = source.get("x-forwarded-host") ?? source.get("host");
  if (!host) return "";
  const proto = source.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}
