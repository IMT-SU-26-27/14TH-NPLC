import { getServerTime } from "@/lib/actions/cp-clock";

let offset: Promise<number> | null = null;

// How far the server clock is ahead of this device, in ms (negative: behind). Measured once per page load and
// shared by every timer on the page; half the round trip is added, as the server read its clock midway.
export function serverClockOffset(): Promise<number> {
  offset ??= (async () => {
    const sent = Date.now();
    const server = await getServerTime();
    const received = Date.now();
    return server + (received - sent) / 2 - received;
  })().catch(() => {
    offset = null;
    return 0;
  });
  return offset;
}
