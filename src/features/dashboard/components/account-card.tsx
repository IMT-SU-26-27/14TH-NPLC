import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AccountCardProps } from "@/types/registration";

export function AccountCard({ user }: AccountCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Your sign-in details.</CardDescription>
        <CardAction>
          <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role === "admin" ? "Admin" : "Participant"}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{user.full_name || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium break-all">{user.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="font-medium">{formatDateTime(user.created_at)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
