import { LineChartIcon, SchoolIcon } from "lucide-react";
import { requireAdmin } from "@/lib/data/auth";
import { getCompetitionStats, getRegistrationTrend, getSchoolStats } from "@/lib/data/admin";
import { getT } from "@/lib/i18n/get-dictionary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { StatsCards } from "@/features/admin/components/stats-cards";
import { RegistrationTrendChart } from "@/features/admin/components/registration-trend-chart";
import { SchoolChart } from "@/features/admin/components/school-chart";
import type { LangProps } from "@/types/i18n";

export async function AdminOverview({ lang }: LangProps) {
  const t = getT(lang);
  await requireAdmin();
  const [stats, trend, schools] = await Promise.all([getCompetitionStats(), getRegistrationTrend(30), getSchoolStats()]);

  return (
    <div className="space-y-4">
      <StatsCards stats={stats} lang={lang} />
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.overview.chartTitle")}</CardTitle>
          <CardDescription>
            {t("admin.overview.chartLead")} {t("admin.overview.totalInRange", { count: trend.total, days: trend.days })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trend.total === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LineChartIcon />
                </EmptyMedia>
                <EmptyTitle>{t("admin.overview.chartEmpty")}</EmptyTitle>
                <EmptyDescription>{t("admin.overview.chartLead")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <RegistrationTrendChart trend={trend} />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.overview.schoolsTitle")}</CardTitle>
          <CardDescription>{t("admin.overview.schoolsLead")}</CardDescription>
        </CardHeader>
        <CardContent>
          {schools.schools.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SchoolIcon />
                </EmptyMedia>
                <EmptyTitle>{t("admin.overview.schoolsEmpty")}</EmptyTitle>
                <EmptyDescription>{t("admin.overview.schoolsLead")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <SchoolChart stats={schools} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
