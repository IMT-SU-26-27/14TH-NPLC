import { OctagonXIcon, UsersIcon } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { previewTeam } from "@/lib/data/registrations";
import { referralCodeSchema } from "@/lib/validations/registration";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { JoinCodeForm } from "@/features/registration/components/join-code-form";
import { JoinTeamForm } from "@/features/registration/components/join-team-form";
import type { JoinSectionProps } from "@/types/registration";

export async function JoinSection({ searchParams }: JoinSectionProps) {
  const { code } = await searchParams;
  const user = await requireUser(code ? `/join?code=${encodeURIComponent(code)}` : "/join");

  const codeCard = (message?: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Join a team</CardTitle>
        <CardDescription>Enter the code your team leader shared with you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <JoinCodeForm defaultCode={code} />
      </CardContent>
    </Card>
  );

  if (!code) return codeCard();

  const parsed = referralCodeSchema.safeParse(code);
  if (!parsed.success) return codeCard(parsed.error.issues[0].message);

  const preview = await previewTeam(parsed.data);
  if (!preview) return codeCard("No team has this code. Check it with your team leader.");

  const spotsLeft = preview.max_members - preview.member_count;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{preview.team_name}</CardTitle>
        <CardDescription>
          {preview.competition_name} · led by {preview.leader_name}
        </CardDescription>
        <CardAction>
          <Badge variant="secondary">
            <UsersIcon />
            {preview.member_count}/{preview.max_members}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        {!preview.is_joinable || spotsLeft <= 0 ? (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertTitle>{spotsLeft <= 0 ? "This team is full" : "This team isn't accepting members"}</AlertTitle>
            <AlertDescription>
              {spotsLeft <= 0
                ? "Ask the leader to remove someone, or join a different team."
                : "Its payment has already been submitted, or registration has closed."}
            </AlertDescription>
          </Alert>
        ) : (
          <JoinTeamForm referralCode={parsed.data} preview={preview} user={user} />
        )}
        <Separator />
        <JoinCodeForm />
      </CardContent>
    </Card>
  );
}
