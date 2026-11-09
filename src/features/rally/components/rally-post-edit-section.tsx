import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { requireAdmin } from "@/lib/data/auth";
import { getRallyPost, listLoAccounts } from "@/lib/data/rally";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { uuidSchema } from "@/lib/validations/admin";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDeleteButton } from "@/features/admin/components/admin-delete-button";
import { RallyPostForm } from "@/features/rally/components/rally-post-form";
import type { RallyPostEditSectionProps } from "@/types/rally";

export async function RallyPostEditSection({ params }: RallyPostEditSectionProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);
  await requireAdmin();
  const { id } = await params;
  if (id && !uuidSchema.safeParse(id).success) notFound();

  const [post, loAccounts] = await Promise.all([id ? getRallyPost(id) : null, listLoAccounts()]);
  if (id && !post) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <Link href={localePath(lang, "/admin/rally")} className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-2" })}>
        <ArrowLeftIcon />
        {t("rally.admin.back")}
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t(post ? "rally.admin.editPost" : "rally.admin.newPost")}</CardTitle>
          <CardDescription>{t("rally.admin.postLead")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RallyPostForm post={post ?? undefined} loAccounts={loAccounts} />
        </CardContent>
      </Card>
      {post && (
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.detail.dangerZone")}</CardTitle>
            <CardDescription>{t("rally.admin.deletePostDescription")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <AdminDeleteButton id={post.id} label={t("rally.admin.deletePost")} target="rallyPost" />
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
