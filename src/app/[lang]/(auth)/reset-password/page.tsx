import type { Metadata } from "next";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthHero } from "@/features/auth/components/auth-hero";
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
    <main className="flex-1">
      <AuthHero
        step="06"
        eyebrow={t("auth.password")}
        title={t("auth.resetTitle")}
        subtitle={t("auth.resetSubtitle")}
        mascot="/auth/maskot-1.webp"
      />
      <div className="flex justify-center px-4 pt-6 pb-16 sm:pt-10 sm:pb-24">
        <Card className="w-full max-w-xl px-2 py-8 sm:px-8 sm:py-10">
          <CardHeader>
            <CardTitle className="text-primary font-mono text-sm font-medium tracking-[0.2em] uppercase">
              {"//"} {t("auth.newPassword")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NewPasswordForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
