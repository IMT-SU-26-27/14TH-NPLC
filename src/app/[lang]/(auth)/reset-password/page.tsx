import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewPasswordForm } from "@/features/auth/components/new-password-form";
import type { LangPageProps } from "@/types/i18n";

export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const t = getT(await resolveLang(params));
  return { title: t("auth.resetTitle"), robots: { index: false } };
}

// Reached from the password reset email: /auth/confirm signs the user in, then sends them here.
// The proxy only lets signed-in users in; updatePassword checks the session again.
export default async function ResetPasswordPage({ params }: LangPageProps) {
  const t = getT(await resolveLang(params));

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">{t("auth.resetTitle")}</CardTitle>
          <CardDescription>{t("auth.resetSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <NewPasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}
