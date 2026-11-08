import Image from "next/image";
import { ExternalLinkIcon, ImageOffIcon } from "lucide-react";
import { privateAssetUrl } from "@/lib/cloudinary/server";
import { getT } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import type { AdminTwibbonProofsProps } from "@/types/admin";

// Rendered only after requireAdmin() in RegistrationDetail. Each member's proof is the link to their Instagram post;
// members who registered before 2026-11-08 may instead have an uploaded screenshot, shown through a signed link
// that expires in 10 minutes.
export function AdminTwibbonProofs({ team, lang }: AdminTwibbonProofsProps) {
  const t = getT(lang);
  const sent = team.members.filter((m) => m.twibbon_post_url || m.twibbon_proof_public_id).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("twibbon.adminTitle")}</CardTitle>
        <CardDescription>{t("twibbon.adminCount", { sent, total: team.members.length })}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {team.members.map((m) => {
            const screenshot = !m.twibbon_post_url && m.twibbon_proof_public_id ? privateAssetUrl(m.twibbon_proof_public_id, m.twibbon_proof_format ?? "png") : null;
            return (
              <li key={m.id} className="min-w-0 space-y-2">
                <p className="truncate text-sm font-medium">{m.full_name}</p>
                {m.twibbon_post_url ? (
                  <a
                    href={m.twibbon_post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-start")}
                  >
                    <span className="min-w-0 truncate">{m.twibbon_post_url.replace(/^https:\/\/(www\.)?/, "")}</span>
                    <ExternalLinkIcon data-icon="inline-end" />
                  </a>
                ) : screenshot ? (
                  <a href={screenshot} target="_blank" rel="noopener noreferrer" className="block">
                    <Image
                      src={screenshot}
                      alt={t("twibbon.adminAlt", { name: m.full_name })}
                      width={320}
                      height={320}
                      unoptimized
                      className="bg-muted aspect-square w-full rounded-lg border object-contain"
                    />
                  </a>
                ) : (
                  <Empty className="border p-4">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <ImageOffIcon />
                      </EmptyMedia>
                      <EmptyDescription>{t("twibbon.adminNone")}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
