"use client";

import { RouteError } from "@/components/shared/route-error";
import type { RouteErrorProps } from "@/types/system";

export default function Error(props: RouteErrorProps) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-16">
      <RouteError {...props} />
    </main>
  );
}
