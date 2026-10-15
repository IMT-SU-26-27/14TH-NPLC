"use client";

import { ListChecksIcon } from "lucide-react";
import { formatDateTime, formatScore } from "@/lib/format";
import { useI18n } from "@/hooks/use-i18n";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerdictBadge } from "@/features/cp/components/verdict-badge";
import type { ResultsPanelProps } from "@/types/cp";

export function ResultsPanel({ result, recent, pending }: ResultsPanelProps) {
  const { t, lang } = useI18n();

  return (
    <Card>
      <CardContent>
        <Tabs defaultValue="result" className="gap-4">
          <TabsList className="w-full">
            <TabsTrigger value="result">{t("cp.results")}</TabsTrigger>
            <TabsTrigger value="history">{t("cp.submissions")}</TabsTrigger>
          </TabsList>

          <TabsContent value="result" className="space-y-4">
            {pending ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : !result ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ListChecksIcon />
                  </EmptyMedia>
                  <EmptyDescription>{t("cp.noResult")}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <VerdictBadge verdict={result.verdict} />
                    <span className="text-sm">{t("cp.passed", { passed: result.passed, total: result.total })}</span>
                  </div>
                  {result.submissionId ? (
                    <p className="text-muted-foreground text-sm">
                      {t("cp.score", { score: formatScore(result.score, lang), points: result.points })} ·{" "}
                      {t("cp.efficiency", { value: Math.round(result.efficiency * 100) })}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-xs">{t("cp.sampleRunNote")}</p>
                  )}
                  <p className="text-muted-foreground text-sm">{t(`cp.verdict.${result.verdict}.description`)}</p>
                </div>

                {result.compileOutput && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t("cp.compileOutput")}</p>
                    <pre className="bg-muted text-destructive max-h-48 overflow-auto rounded-lg p-3 font-mono text-xs whitespace-pre-wrap">
                      {result.compileOutput}
                    </pre>
                  </div>
                )}

                <ItemGroup className="gap-2">
                  {result.tests.map((test) => (
                    <Item key={test.testCaseId} variant="outline" size="sm" className="flex-col items-stretch">
                      <div className="flex items-center gap-2">
                        <ItemContent>
                          <ItemTitle>
                            {t("cp.test", { n: test.ordinal })}
                            <Badge variant="outline">{test.isSample ? t("cp.sample") : t("cp.hidden")}</Badge>
                          </ItemTitle>
                          <ItemDescription className="font-mono">
                            {test.timeMs ?? "–"} ms · {test.memoryKb ?? "–"} KB
                          </ItemDescription>
                        </ItemContent>
                        <VerdictBadge verdict={test.verdict} />
                      </div>
                      {test.isSample &&
                        !["accepted", "compilation_error", "internal_error", "exec_format_error"].includes(test.verdict) && (
                        <div className="grid gap-2 pt-2 sm:grid-cols-2">
                          <div className="space-y-1">
                            <p className="text-muted-foreground text-xs">{t("cp.expected")}</p>
                            <pre className="bg-muted max-h-32 overflow-auto rounded p-2 font-mono text-xs">{test.expectedOutput}</pre>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground text-xs">{t("cp.actual")}</p>
                            <pre className="bg-muted max-h-32 overflow-auto rounded p-2 font-mono text-xs">{test.stdout || " "}</pre>
                          </div>
                          {test.stderr && (
                            <div className="space-y-1 sm:col-span-2">
                              <p className="text-muted-foreground text-xs">{t("cp.stderr")}</p>
                              <pre className="bg-muted text-destructive max-h-32 overflow-auto rounded p-2 font-mono text-xs whitespace-pre-wrap">
                                {test.stderr}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </Item>
                  ))}
                </ItemGroup>
              </>
            )}
          </TabsContent>

          <TabsContent value="history">
            {recent.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyDescription>{t("cp.noSubmissions")}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.content.date")}</TableHead>
                    <TableHead>{t("cp.language")}</TableHead>
                    <TableHead>{t("cp.results")}</TableHead>
                    <TableHead className="text-right">{t("cp.totalPoints")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-muted-foreground text-xs">{formatDateTime(s.created_at, lang)}</TableCell>
                      <TableCell>{t(`cp.languages.${s.language}`)}</TableCell>
                      <TableCell>
                        <VerdictBadge verdict={s.verdict} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatScore(s.score, lang)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
