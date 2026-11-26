import "server-only";
import { cookies, headers } from "next/headers";
import { z } from "zod";

// One random id per browser: every tab of that browser is the same device, whoever is signed in there.
const DEVICE_COOKIE = "nplc_device";
const deviceIdSchema = z.uuid();

export async function readDeviceId(): Promise<string | null> {
  const parsed = deviceIdSchema.safeParse((await cookies()).get(DEVICE_COOKIE)?.value);
  return parsed.success ? parsed.data : null;
}

// Server Actions only: creates the id on the first contest page this browser opens.
export async function ensureDeviceId(): Promise<string> {
  const existing = await readDeviceId();
  if (existing) return existing;
  const id = crypto.randomUUID();
  (await cookies()).set(DEVICE_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/SamsungBrowser/, "Samsung Internet"],
  [/Firefox\/|FxiOS/, "Firefox"],
  [/Chrome\/|CriOS/, "Chrome"],
  [/Safari\//, "Safari"],
];

const SYSTEMS: [RegExp, string][] = [
  [/iPhone/, "iPhone"],
  [/iPad/, "iPad"],
  [/Android/, "Android"],
  [/Windows/, "Windows"],
  [/Mac OS X|Macintosh/, "Mac"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
];

// "Chrome · Windows": enough for a team to recognise its own laptop or phone.
export function deviceLabelFrom(userAgent: string): string {
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1];
  const system = SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1];
  return [browser, system].filter(Boolean).join(" · ");
}

export async function currentDeviceLabel(): Promise<string> {
  return deviceLabelFrom((await headers()).get("user-agent") ?? "");
}
