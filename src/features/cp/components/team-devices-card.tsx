import { MonitorSmartphoneIcon, PowerOffIcon } from "lucide-react";
import { getAdminTeamDevices } from "@/lib/data/team-device";
import { formatTimestamp, formatWibTime } from "@/lib/format";
import { getT } from "@/lib/i18n/get-dictionary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SingleDeviceSwitch } from "@/features/cp/components/single-device-switch";
import { TeamDeviceResetButton } from "@/features/cp/components/team-device-reset-button";
import type { TeamDevicesCardProps } from "@/types/team-device";

// Admin -> CP -> Activity: which device holds each team, a reset per team, the rule switch and the latest changes.
export async function TeamDevicesCard({ competitionId, lang }: TeamDevicesCardProps) {
  const t = getT(lang);
  const { singleDevice, devices, events } = await getAdminTeamDevices(competitionId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.devices.title")}</CardTitle>
        <CardDescription>{t("admin.devices.lead")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SingleDeviceSwitch competitionId={competitionId} enabled={singleDevice} />
        {!singleDevice && (
          <Alert>
            <PowerOffIcon />
            <AlertTitle>{t("admin.devices.offTitle")}</AlertTitle>
            <AlertDescription>{t("admin.devices.offLead")}</AlertDescription>
          </Alert>
        )}

        {devices.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MonitorSmartphoneIcon />
              </EmptyMedia>
              <EmptyTitle>{t("admin.devices.emptyTitle")}</EmptyTitle>
              <EmptyDescription>{t("admin.devices.emptyDescription")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.devices.team")}</TableHead>
                  <TableHead>{t("admin.devices.device")}</TableHead>
                  <TableHead>{t("admin.devices.member")}</TableHead>
                  <TableHead>{t("admin.devices.lastSeen")}</TableHead>
                  <TableHead className="w-0" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((d) => (
                  <TableRow key={d.registrationId}>
                    <TableCell className="font-medium">{d.teamName}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{d.holderLabel || "–"}</span>
                        {d.pendingName !== null && (
                          <Badge variant="outline" className="border-primary text-primary">
                            {t("admin.devices.asking", { name: d.pendingName || t("cp.device.someone") })}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{d.holderName ?? "–"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums">{formatWibTime(d.seenAt, lang)}</span>
                        {d.online ? (
                          <Badge variant="secondary">{t("admin.devices.online")}</Badge>
                        ) : (
                          <Badge variant="outline" className="border-warning text-warning">
                            {t("admin.devices.offline")}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <TeamDeviceResetButton registrationId={d.registrationId} teamName={d.teamName} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <section className="space-y-2">
          <h3 className="font-heading text-sm font-medium">{t("admin.devices.history")}</h3>
          {events.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("admin.devices.historyEmpty")}</p>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.devices.at")}</TableHead>
                    <TableHead>{t("admin.devices.team")}</TableHead>
                    <TableHead>{t("admin.devices.event")}</TableHead>
                    <TableHead>{t("admin.devices.by")}</TableHead>
                    <TableHead>{t("admin.devices.eventDevice")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="tabular-nums">{formatTimestamp(e.createdAt, lang)}</TableCell>
                      <TableCell>{e.teamName}</TableCell>
                      <TableCell>{t(`admin.devices.action.${e.action}`)}</TableCell>
                      <TableCell>{e.memberName ?? "–"}</TableCell>
                      <TableCell className="text-muted-foreground">{e.label || "–"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
