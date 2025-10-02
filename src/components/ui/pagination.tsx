"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  currentPage: number;
  totalPages: number;
  onChange?: (newPage: number) => void;
};

export default function Pagination({ currentPage, totalPages }: Props) {
  const params = new URLSearchParams(window.location.search);

  const onPrev = () => {
    if (currentPage <= 1) return;
    params.set("page", String(currentPage - 1));
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
  };

  const onNext = () => {
    if (currentPage >= totalPages) return;
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(currentPage + 1));
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
  };

  return (
    <div className={`flex items-center justify-between gap-2`}>
      <Button
        size="sm"
        variant="outline"
        onClick={onPrev}
        disabled={currentPage <= 1}
      >
        Prev
      </Button>

      <div className="px-3 py-1 rounded-md bg-muted/30 text-sm">
        Page <strong className="mx-1">{currentPage}</strong> / {totalPages}
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={onNext}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </div>
  );
}
