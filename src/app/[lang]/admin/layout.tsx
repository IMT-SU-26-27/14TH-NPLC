import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { AdminNav } from "@/features/admin/components/admin-nav";

export async function generateMetadata({ params }: LayoutProps<"/[lang]/admin">): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return {
    title: { default: t("nav.admin"), template: `%s · ${t("nav.admin")} · ${t("meta.siteName")}` },
    robots: { index: false, follow: false },
  };
}

export default function AdminLayout({ children }: LayoutProps<"/[lang]/admin">) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8">
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <AdminNav />
      </Suspense>
      {children}
    </main>
  );
}
