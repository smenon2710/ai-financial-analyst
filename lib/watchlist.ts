"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "afa:watchlist";

function readStoredWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeStoredWatchlist(tickers: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickers));
}

/** Watchlist tickers persisted to localStorage. Reads happen in an effect
 * (not during render) so server and initial client render both start
 * empty — avoids hydration mismatches. */
export function useWatchlist() {
  const [tickers, setTickers] = useState<string[]>([]);

  useEffect(() => {
    setTickers(readStoredWatchlist());
  }, []);

  const add = useCallback((ticker: string) => {
    setTickers((prev) => {
      if (prev.includes(ticker)) return prev;
      const next = [...prev, ticker];
      writeStoredWatchlist(next);
      return next;
    });
  }, []);

  const remove = useCallback((ticker: string) => {
    setTickers((prev) => {
      const next = prev.filter((t) => t !== ticker);
      writeStoredWatchlist(next);
      return next;
    });
  }, []);

  return { tickers, add, remove };
}
