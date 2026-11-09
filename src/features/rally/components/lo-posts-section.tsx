import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPinIcon } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { listMyLoPosts } from "@/lib/data/rally";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import type { LangProps } from "@/types/i18n";

export async function LoPostsSection({ lang }: LangProps) {
  const t = getT(lang);
  const user = await requireUser("/lo");
  const posts = await listMyLoPosts(user.id);

  if (posts.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MapPinIcon />
          </EmptyMedia>
          <EmptyTitle>{t("rally.lo.emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("rally.lo.emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  // Nothing to choose with a single post.
  if (posts.length === 1) redirect(localePath(lang, `/lo/posts/${posts[0].id}`));

  return (
    <ItemGroup className="gap-2">
      {posts.map((post) => (
        <Item key={post.id} variant="outline" className="bg-card" render={<Link href={localePath(lang, `/lo/posts/${post.id}`)} />}>
          <ItemMedia variant="icon">
            <MapPinIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              {post.name}
              {!post.is_active && <Badge variant="outline">{t("rally.admin.inactive")}</Badge>}
            </ItemTitle>
            <ItemDescription>
              {t(`rally.kind.${post.kind}`)}
              {post.location && ` · ${post.location}`}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}
