import Link from "next/link";
import { CircleOffIcon } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { getActiveCompetitionBySlug, isRegistrationOpen } from "@/lib/data/competitions";
import { COMPETITION_TYPE_LABEL, formatRupiah, formatTeamSize } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { RegisterTeamForm } from "@/features/registration/components/register-team-form";
import type { RegisterPageProps } from "@/types/registration";

export async function RegisterSection({ params }: RegisterPageProps) {
  const { slug } = await params;
  const [user, competition] = await Promise.all([requireUser(`/register/${slug}`), getActiveCompetitionBySlug(slug)]);

  if (!competition || !isRegistrationOpen(competition)) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleOffIcon />
          </EmptyMedia>
          <EmptyTitle>{competition ? "Registration is closed" : "Competition not found"}</EmptyTitle>
          <EmptyDescription>
            {competition ? "This competition isn't accepting new teams right now." : "It may have been removed or renamed."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/#competitions" className={buttonVariants({ variant: "outline" })}>
            See all competitions
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Register for {competition.name}</CardTitle>
        <CardDescription>
          {COMPETITION_TYPE_LABEL[competition.type]} · team of {formatTeamSize(competition.min_members, competition.max_members)} ·{" "}
          {formatRupiah(competition.fee)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterTeamForm competition={competition} user={user} />
      </CardContent>
    </Card>
  );
}
