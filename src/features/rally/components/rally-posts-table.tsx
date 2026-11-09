import Link from "next/link";
import { MapPinIcon } from "lucide-react";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RallyPostsTableProps } from "@/types/rally";

export function RallyPostsTable({ posts, lang }: RallyPostsTableProps) {
  const t = getT(lang);

  if (posts.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MapPinIcon />
          </EmptyMedia>
          <EmptyTitle>{t("rally.admin.emptyPostsTitle")}</EmptyTitle>
          <EmptyDescription>{t("rally.admin.emptyPostsDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("rally.admin.postName")}</TableHead>
            <TableHead>{t("rally.admin.kind")}</TableHead>
            <TableHead className="text-right">{t("rally.admin.pointsWin")}</TableHead>
            <TableHead className="text-right">{t("rally.admin.pointsLose")}</TableHead>
            <TableHead className="text-right">{t("rally.admin.pointsDraw")}</TableHead>
            <TableHead>{t("rally.admin.los")}</TableHead>
            <TableHead>{t("admin.registrations.status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">
                <Link href={localePath(lang, `/admin/rally/posts/${post.id}`)} className="underline-offset-4 hover:underline">
                  {post.name}
                </Link>
                {post.location && <span className="text-muted-foreground block text-xs font-normal">{post.location}</span>}
              </TableCell>
              <TableCell>{t(`rally.kind.${post.kind}`)}</TableCell>
              <TableCell className="text-right">{post.points_win}</TableCell>
              <TableCell className="text-right">{post.points_lose}</TableCell>
              <TableCell className="text-right">{post.allow_draw ? post.points_draw : "—"}</TableCell>
              <TableCell className="max-w-56 whitespace-normal">
                {post.assignments.flatMap((a) => (a.lo ? [a.lo.full_name] : [])).join(", ") || <span className="text-muted-foreground">{t("rally.admin.noLo")}</span>}
              </TableCell>
              <TableCell>
                <Badge variant={post.is_active ? "default" : "outline"}>{t(post.is_active ? "rally.admin.active" : "rally.admin.inactive")}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
