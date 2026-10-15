"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useI18n } from "@/hooks/use-i18n";
import { INTL_LOCALE } from "@/lib/i18n/config";
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
import type { RegistrationTrendChartProps } from "@/types/admin";

// Series colours follow the competition (stable order), never its rank: c1 -> --chart-1, c2 -> --chart-2.
// Identity is carried by the legend, the crosshair tooltip and the table view; end labels collided when lines overlapped.
export function RegistrationTrendChart({ trend }: RegistrationTrendChartProps) {
  const { t, lang } = useI18n();
  const day = new Intl.DateTimeFormat(INTL_LOCALE[lang], { day: "numeric", month: "short", timeZone: "UTC" });
  const fullDay = new Intl.DateTimeFormat(INTL_LOCALE[lang], { dateStyle: "medium", timeZone: "UTC" });
  const formatDay = (value: string) => day.format(new Date(`${value}T00:00:00Z`));

  const config = Object.fromEntries(
    trend.series.map((s, i) => [s.key, { label: s.name, color: `var(--chart-${Math.min(i + 1, 5)})` }]),
  ) satisfies ChartConfig;

  return (
    <Tabs defaultValue="chart" className="gap-4">
      <TabsList>
        <TabsTrigger value="chart">{t("admin.overview.chartTab")}</TabsTrigger>
        <TabsTrigger value="table">{t("admin.overview.tableTab")}</TabsTrigger>
      </TabsList>

      <TabsContent value="chart">
        <ChartContainer config={config} className="aspect-auto h-72 w-full">
          <LineChart data={trend.points} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} tickFormatter={formatDay} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              content={<ChartTooltipContent className="min-w-56" indicator="line" labelFormatter={(value) => fullDay.format(new Date(`${value}T00:00:00Z`))} />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {trend.series.map((s) => (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.name}
                type="monotone"
                stroke={`var(--color-${s.key})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </TabsContent>

      <TabsContent value="table">
        <div className="max-h-72 overflow-y-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.overview.date")}</TableHead>
                {trend.series.map((s) => (
                  <TableHead key={s.key} className="text-right">
                    {s.name}
                  </TableHead>
                ))}
                <TableHead className="text-right">{t("admin.overview.total")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...trend.points].reverse().map((point) => {
                const total = trend.series.reduce((sum, s) => sum + Number(point[s.key]), 0);
                return (
                  <TableRow key={point.date as string}>
                    <TableCell>{fullDay.format(new Date(`${point.date}T00:00:00Z`))}</TableCell>
                    {trend.series.map((s) => (
                      <TableCell key={s.key} className="text-right">
                        {point[s.key]}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-medium">{total}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
