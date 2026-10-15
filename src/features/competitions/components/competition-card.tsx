import Link from "next/link";
import { CalendarIcon, UsersIcon, WalletIcon } from "lucide-react";
import { COMPETITION_TYPE_LABEL, formatDateTime, formatRupiah, formatTeamSize } from "@/lib/format";
import { isRegistrationOpen } from "@/lib/data/competitions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompetitionCardProps } from "@/types/competition";

export function CompetitionCard({ competition }: CompetitionCardProps) {
  const open = isRegistrationOpen(competition);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{competition.name}</CardTitle>
        <CardDescription>{COMPETITION_TYPE_LABEL[competition.type]}</CardDescription>
        <CardAction>
          <Badge variant={open ? "default" : "outline"}>{open ? "Open" : "Closed"}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {competition.description && <p className="text-muted-foreground">{competition.description}</p>}
        <ul className="text-muted-foreground space-y-2">
          <li className="flex items-center gap-2">
            <UsersIcon className="size-4" />
            Team of {formatTeamSize(competition.min_members, competition.max_members)}
          </li>
          <li className="flex items-center gap-2">
            <WalletIcon className="size-4" />
            {formatRupiah(competition.fee)}
          </li>
          {competition.registration_closes_at && (
            <li className="flex items-center gap-2">
              <CalendarIcon className="size-4" />
              Closes {formatDateTime(competition.registration_closes_at)}
            </li>
          )}
        </ul>
      </CardContent>
      <CardFooter>
        {open ? (
          <Link href={`/register/${competition.slug}`} className={buttonVariants({ className: "w-full" })}>
            Register a team
          </Link>
        ) : (
          <span className={buttonVariants({ variant: "outline", className: "pointer-events-none w-full opacity-50" })}>
            Registration closed
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
