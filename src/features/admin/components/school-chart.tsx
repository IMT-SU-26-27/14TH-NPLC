"use client";

import { useState } from "react";
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
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SchoolChartProps, SchoolStatRow } from "@/types/admin";

// Every school is charted; the chart scrolls after ten rows, with half of the next row showing so the scroll is visible.
const VISIBLE_ROWS = 10.5;
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
  const [competition, setCompetition] = useState("all");
  const shown = competition === "all" ? stats.series : stats.series.filter((s) => s.key === competition);
  const all: SchoolStatRow[] = stats.schools.map((row) => ({ ...row, label: row.school || t("admin.overview.noSchool") }));
  // One competition: only schools with a team in it, ranked by that competition.
  const rows = competition === "all" ? all : all.filter((row) => Number(row[competition]) > 0).sort((a, b) => Number(b[competition]) - Number(a[competition]));
  const last = shown.at(-1)?.key;
  // Totals follow the filter: one competition counts only its own teams and participants.
  const count = (row: SchoolStatRow, suffix: "" | "People") =>
    competition === "all" ? (suffix ? row.people : row.teams) : Number(row[`${competition}${suffix}`]);
  const teams = rows.reduce((sum, row) => sum + count(row, ""), 0);
  const people = rows.reduce((sum, row) => sum + count(row, "People"), 0);
  // A competition with no teams yet (e.g. just created) filters every school out.
  const empty = (
    <Empty className="border">
      <EmptyHeader>
        <EmptyDescription>{t("admin.overview.schoolsEmpty")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
  const competitionItems = [
    { value: "all", label: t("admin.registrations.allCompetitions") },
    ...stats.series.map((s) => ({ value: s.key, label: s.name })),
  ];

  const config = Object.fromEntries(
    stats.series.map((s, i) => [s.key, { label: s.name, color: `var(--chart-${Math.min(i + 1, 5)})` }]),
  ) satisfies ChartConfig;

  return (
    <Tabs defaultValue="chart" className="gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <TabsList>
            <TabsTrigger value="chart">{t("admin.overview.chartTab")}</TabsTrigger>
            <TabsTrigger value="table">{t("admin.overview.tableTab")}</TabsTrigger>
          </TabsList>
          <p className="text-muted-foreground text-sm" aria-live="polite">
            {t("admin.overview.schoolsSummary", { schools: rows.length, teams, people })}
          </p>
        </div>
        <Select items={competitionItems} value={competition} onValueChange={(value) => setCompetition(String(value ?? "all"))}>
          <SelectTrigger className="w-56" aria-label={t("admin.registrations.competition")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {competitionItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TabsContent value="chart">
        {/* The axis and legend sit on top so they stay in view at the start of the scroll. Focusable so the
            keyboard can scroll it (Safari does not focus scroll areas on its own). */}
        {rows.length === 0 ? (
          empty
        ) : (
          <div
            role="region"
            aria-label={t("admin.overview.schoolsTitle")}
            tabIndex={0}
            className="focus-visible:ring-ring/50 overflow-y-auto rounded-md outline-none focus-visible:ring-3"
            style={{ maxHeight: VISIBLE_ROWS * ROW_PX + 72 }}
          >
            <ChartContainer config={config} className="aspect-auto w-full" style={{ height: rows.length * ROW_PX + 72 }}>
              <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }} barCategoryGap={8}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" orientation="top" domain={[0, "dataMax"]} allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  width={LABEL_PX}
                  tickFormatter={(value: string) => (value.length > LABEL_CHARS ? `${value.slice(0, LABEL_CHARS - 1)}…` : value)}
                />
                <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent className="min-w-64" />} />
                <ChartLegend verticalAlign="top" content={<ChartLegendContent className="pt-0 pb-2" />} />
                {shown.map((s) => (
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
          </div>
        )}
      </TabsContent>

      <TabsContent value="table">
        {rows.length === 0 ? (
          empty
        ) : (
          <div className="max-h-96 overflow-y-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.overview.school")}</TableHead>
                  {shown.map((s) => (
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
                    {shown.map((s) => (
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
        )}
      </TabsContent>
    </Tabs>
  );
}
