import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, CircleOffIcon } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { getRallySession, listMyLoPosts, listRecentRallyResults } from "@/lib/data/rally";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { resolveLang } from "@/lib/i18n/server";
import { uuidSchema } from "@/lib/validations/admin";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { LoStation } from "@/features/rally/components/lo-station";
import type { LoPostPageProps } from "@/types/rally";

export async function LoPostSection({ params }: LoPostPageProps) {
  const lang = await resolveLang(params);
  const t = getT(lang);
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();

  const user = await requireUser(`/lo/posts/${id}`);
  const posts = await listMyLoPosts(user.id);
  const post = posts.find((p) => p.id === id);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        {posts.length > 1 && (
          <Link href={localePath(lang, "/lo")} className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-2" })}>
            <ArrowLeftIcon />
            {t("rally.lo.allPosts")}
          </Link>
        )}
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{post.name}</h1>
        <p className="text-muted-foreground">
          {t(`rally.kind.${post.kind}`)}
          {post.location && ` · ${post.location}`}
        </p>
      </div>
      {post.is_active ? (
        <LoStation post={post} recent={await listRecentRallyResults(post.id)} sessionStatus={(await getRallySession(post.competition_id)).status} />
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleOffIcon />
            </EmptyMedia>
            <EmptyTitle>{t("rally.errors.postInactive")}</EmptyTitle>
            <EmptyDescription>{t("rally.lo.inactiveHint")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
