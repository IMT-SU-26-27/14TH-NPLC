import { getT } from "@/lib/i18n/get-dictionary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminDeleteButton } from "@/features/admin/components/admin-delete-button";
import { LoAccountForm } from "@/features/rally/components/lo-account-form";
import type { LoAccountsCardProps } from "@/types/rally";

export function LoAccountsCard({ accounts, lang }: LoAccountsCardProps) {
  const t = getT(lang);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("rally.admin.loTitle")}</CardTitle>
        <CardDescription>{t("rally.admin.loLead")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {accounts.length > 0 && (
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.fullName")}</TableHead>
                  <TableHead>{t("common.email")}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.full_name}</TableCell>
                    <TableCell>{account.email}</TableCell>
                    <TableCell className="text-right">
                      <AdminDeleteButton id={account.id} label={t("rally.admin.deleteLo")} target="loAccount" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {accounts.length > 0 && <Separator />}
        <LoAccountForm />
      </CardContent>
    </Card>
  );
}
