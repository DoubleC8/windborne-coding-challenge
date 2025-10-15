import { useState, useCallback } from "react";

export function usePagination(totalItems: number, itemsPerPage: number) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const canGoNext = page < totalPages - 1;
  const canGoPrev = page > 0;

  const goNext = useCallback(() => {
    if (canGoNext) setPage((p) => p + 1);
  }, [canGoNext]);

  const goPrev = useCallback(() => {
    if (canGoPrev) setPage((p) => p - 1);
  }, [canGoPrev]);

  const reset = useCallback(() => setPage(0), []);

  return {
    page,
    canGoNext,
    canGoPrev,
    goNext,
    goPrev,
    reset,
    startIndex: page * itemsPerPage,
    endIndex: Math.min((page + 1) * itemsPerPage, totalItems),
  };
}

