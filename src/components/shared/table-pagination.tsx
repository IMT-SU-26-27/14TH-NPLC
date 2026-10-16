import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { TablePaginationProps } from "@/types";

// 1 … 4 5 6 … 12: first, last, and the pages around the current one.
function visiblePages(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages: (number | "gap")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) pages.push("gap");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < pageCount - 1) pages.push("gap");
  pages.push(pageCount);
  return pages;
}

// Result count on the left, page links on the right. Always shown, so it's clear the list is paginated.
export function TablePagination({ page, pageCount, hrefFor, summary, previousLabel, nextLabel }: TablePaginationProps) {
  const first = page <= 1;
  const last = page >= pageCount;

  return (
    <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-sm">
      <span>{summary}</span>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              text={previousLabel}
              aria-label={previousLabel}
              href={first ? undefined : hrefFor(page - 1)}
              aria-disabled={first}
              className={cn(first && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
          {visiblePages(page, pageCount).map((p, i) =>
            p === "gap" ? (
              <PaginationItem key={`gap-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink href={hrefFor(p)} isActive={p === page} className="tabular-nums">
                  {p}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              text={nextLabel}
              aria-label={nextLabel}
              href={last ? undefined : hrefFor(page + 1)}
              aria-disabled={last}
              className={cn(last && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
