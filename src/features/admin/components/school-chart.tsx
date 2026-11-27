"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useI18n } from "@/hooks/use-i18n";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SchoolChartProps, SchoolStatRow } from "@/types/admin";

// The chart shows the schools with the most teams; the table lists every school.
const TOP = 10;
const ROW_PX = 36;
// Long school names are cut to one line (Recharts wraps a tick wider than the axis); the full name is in the tooltip
// and the table.
const LABEL_PX = 196;
const LABEL_CHARS = 22;

// Teams per school, stacked by competition. Colours follow the competition as in the trend chart (c1 -> --chart-1);
// blue and purple are close for protanopia, so the legend, the 2px card-coloured gap between segments and the table
// carry identity too.
export function SchoolChart({ stats }: SchoolChartProps) {
  const { t } = useI18n();
  const rows: SchoolStatRow[] = stats.schools.map((row) => ({ ...row, label: row.school || t("admin.overview.noSchool") }));
  const top = rows.slice(0, TOP);
  const last = stats.series.at(-1)?.key;

  const config = Object.fromEntries(
    stats.series.map((s, i) => [s.key, { label: s.name, color: `var(--chart-${Math.min(i + 1, 5)})` }]),
  ) satisfies ChartConfig;

  return (
    <Tabs defaultValue="chart" className="gap-4">
      <TabsList>
        <TabsTrigger value="chart">{t("admin.overview.chartTab")}</TabsTrigger>
        <TabsTrigger value="table">{t("admin.overview.tableTab")}</TabsTrigger>
      </TabsList>

      <TabsContent value="chart" className="space-y-2">
        <ChartContainer config={config} className="aspect-auto w-full" style={{ height: top.length * ROW_PX + 64 }}>
          <BarChart data={top} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 0 }} barCategoryGap={8}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              width={LABEL_PX}
              tickFormatter={(value: string) => (value.length > LABEL_CHARS ? `${value.slice(0, LABEL_CHARS - 1)}…` : value)}
            />
            <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent className="min-w-64" />} />
            <ChartLegend content={<ChartLegendContent />} />
            {stats.series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.name}
                stackId="teams"
                fill={`var(--color-${s.key})`}
                stroke="var(--card)"
                strokeWidth={2}
                radius={s.key === last ? [0, 4, 4, 0] : 0}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ChartContainer>
        {rows.length > TOP && <p className="text-muted-foreground text-xs">{t("admin.overview.schoolsTop", { count: TOP, total: rows.length })}</p>}
      </TabsContent>

      <TabsContent value="table">
        <div className="max-h-96 overflow-y-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.overview.school")}</TableHead>
                {stats.series.map((s) => (
                  <TableHead key={s.key} className="text-right">
                    {s.name}
                  </TableHead>
                ))}
                <TableHead className="text-right">{t("admin.overview.schoolTeams")}</TableHead>
                <TableHead className="text-right">{t("admin.overview.schoolPeople")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell className={row.school ? undefined : "text-muted-foreground"}>{row.label}</TableCell>
                  {stats.series.map((s) => (
                    <TableCell key={s.key} className="text-right">
                      {row[s.key]}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-medium">{row.teams}</TableCell>
                  <TableCell className="text-right">{row.people}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
