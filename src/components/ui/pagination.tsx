import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

function getPageNumbers(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (page <= 4) {
    pages.push(2, 3, 4, 5, "...", totalPages);
  } else if (page >= totalPages - 3) {
    pages.push("...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push("...", page - 1, page, page + 1, "...", totalPages);
  }

  return pages;
}

export function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      {page === 1 ? (
        <span className="flex size-8 cursor-not-allowed items-center justify-center rounded-md text-muted-foreground/40">
          <ChevronLeft className="size-4" />
        </span>
      ) : (
        <Link
          href={buildHref(page - 1)}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Link>
      )}

      {pageNumbers.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="flex size-8 items-center justify-center text-xs text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            className={cn(
              "flex size-8 items-center justify-center rounded-md text-sm",
              p === page
                ? "bg-primary text-primary-foreground font-medium pointer-events-none"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Link>
        ),
      )}

      {page === totalPages ? (
        <span className="flex size-8 cursor-not-allowed items-center justify-center rounded-md text-muted-foreground/40">
          <ChevronRight className="size-4" />
        </span>
      ) : (
        <Link
          href={buildHref(page + 1)}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Link>
      )}
    </nav>
  );
}
