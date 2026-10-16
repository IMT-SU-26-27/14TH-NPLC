"use client";

import { RotateCwIcon, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import type { RouteErrorProps } from "@/types/system";
import "./globals.css";

// Replaces the root layout when it fails, so there is no I18nProvider: both languages are shown.
export default function GlobalError({ error, retry }: RouteErrorProps) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="bg-background text-foreground flex min-h-full items-center justify-center px-4 font-sans">
        <Empty className="max-w-lg">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TriangleAlertIcon />
            </EmptyMedia>
            <EmptyTitle>Terjadi kesalahan</EmptyTitle>
            <EmptyDescription>
              Halaman ini gagal dimuat. Coba lagi sebentar lagi.
              <span className="mt-1 block">Something went wrong loading this page. Please try again.</span>
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => retry()}>
              <RotateCwIcon />
              Coba lagi · Try again
            </Button>
          </EmptyContent>
          {error.digest && <p className="text-muted-foreground font-mono text-xs">{error.digest}</p>}
        </Empty>
      </body>
    </html>
  );
}
