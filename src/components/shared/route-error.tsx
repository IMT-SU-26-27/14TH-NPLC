"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCwIcon, TriangleAlertIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button, buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import type { RouteErrorProps } from "@/types/system";

// Shared body of the error.tsx boundaries. Server errors only carry a digest, which the
// committee can match against the server logs.
export function RouteError({ error, retry, homeHref = "/", homeLabel = "system.backHome" }: RouteErrorProps) {
  const { t, href } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>
          <h1>{t("system.errorTitle")}</h1>
        </EmptyTitle>
        <EmptyDescription>{t("system.errorDescription")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button onClick={() => retry()}>
          <RotateCwIcon />
          {t("system.retry")}
        </Button>
        <Link href={href(homeHref)} className={buttonVariants({ variant: "outline" })}>
          {t(homeLabel)}
        </Link>
      </EmptyContent>
      {error.digest && (
        <p className="text-muted-foreground text-xs">
          {t("system.errorReference")} <span className="font-mono">{error.digest}</span>
        </p>
      )}
    </Empty>
  );
}
