import { requireAdmin } from "@/lib/data/auth";
import { listCompetitionOptions } from "@/lib/data/admin";
import { getT } from "@/lib/i18n/get-dictionary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCreateRegistrationForm } from "@/features/admin/components/admin-create-registration-form";
import type { LangProps } from "@/types/i18n";

export async function AdminCreateRegistrationSection({ lang }: LangProps) {
  const t = getT(lang);
  await requireAdmin();
  const competitions = await listCompetitionOptions();

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">{t("admin.create.title")}</CardTitle>
        <CardDescription>{t("admin.create.lead")}</CardDescription>
      </CardHeader>
      <CardContent>
        <AdminCreateRegistrationForm competitions={competitions} />
      </CardContent>
    </Card>
  );
}
