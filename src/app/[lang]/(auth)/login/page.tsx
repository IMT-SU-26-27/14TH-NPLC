import { Suspense } from "react";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthFormLoader } from "@/features/auth/components/auth-form-loader";
import type { AuthPageProps } from "@/types/auth";

export async function generateMetadata({ params }: AuthPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("auth.signInTitle"), description: t("meta.loginDescription") };
}

export default async function LoginPage({ params, searchParams }: AuthPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">{t("auth.signInTitle")}</CardTitle>
          <CardDescription>{t("auth.signInSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <AuthFormLoader mode="login" lang={lang} searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
