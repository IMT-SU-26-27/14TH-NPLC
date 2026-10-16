"use client";

import { RouteError } from "@/components/shared/route-error";
import type { RouteErrorProps } from "@/types/system";

// Renders inside the admin layout, so the admin nav stays usable.
export default function AdminError(props: RouteErrorProps) {
  return <RouteError {...props} homeHref="/admin" homeLabel="system.backAdmin" />;
}
