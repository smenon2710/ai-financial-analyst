"use client";

import { useEffect, useState } from "react";
import { PriceChart } from "./PriceChart";
import { VerdictStamp } from "./VerdictStamp";
import { NewsList } from "./NewsList";
import { AnalysisMarkdown } from "./AnalysisMarkdown";
import type { NewsArticle } from "@/lib/news";
import { PERIODS, type Period } from "@/lib/periods";
import type { StockData } from "@/lib/stockData";
import type { Recommendation, Sentiment } from "@/lib/verdict";

interface AnalyzeResponse {
  analysis: string;
  verdict: { sentiment: Sentiment; recommendation: Recommendation };
}

export function AnalysisPanel({
  ticker,
  isWatchlisted,
  onToggleWatchlist,
}: {
  ticker: string;
  isWatchlisted: boolean;
  onToggleWatchlist: () => void;
}) {
  const [period, setPeriod] = useState<Period>("1mo");

  // Price/chart data — refetched on every period change, but never touches
  // the LLM, so flipping through periods costs nothing.
  const [quote, setQuote] = useState<StockData | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteRetryNonce, setQuoteRetryNonce] = useState(0);

  // LLM analysis + verdict — fetched once per ticker (server-cached beyond
  // that), independent of period so it's never re-spent on a period switch.
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisRetryNonce, setAnalysisRetryNonce] = useState(0);

  const [news, setNews] = useState<NewsArticle[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        const res = await fetch(
          `/api/quote?ticker=${encodeURIComponent(ticker)}&period=${period}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load price data.");
        if (!cancelled) setQuote(data.stockData);
      } catch (e) {
        if (!cancelled) setQuoteError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [ticker, period, quoteRetryNonce]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setAnalysisLoading(true);
      setAnalysisError(null);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Analysis failed.");
        if (!cancelled) setAnalysis(data);
      } catch (e) {
        if (!cancelled) setAnalysisError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        if (!cancelled) setAnalysisLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [ticker, analysisRetryNonce]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const res = await fetch(`/api/news?ticker=${encodeURIComponent(ticker)}`);
      const data = await res.json();
      if (!cancelled) setNews(data.articles ?? []);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  return (
    <div className="space-y-6 rounded-sm border border-paper/15 bg-paper/[0.03] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg text-paper">{ticker}</h3>
          <button
            type="button"
            onClick={onToggleWatchlist}
            aria-label={
              isWatchlisted ? `Remove ${ticker} from watchlist` : `Add ${ticker} to watchlist`
            }
            className={`text-lg leading-none transition-colors ${
              isWatchlisted ? "text-brass" : "text-paper/30 hover:text-paper/60"
            }`}
          >
            {isWatchlisted ? "★" : "☆"}
          </button>
        </div>
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="appearance-none rounded-sm border border-paper/20 bg-ink py-2 pl-3 pr-7 font-mono text-xs text-paper"
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.6rem] text-brass">
            ▾
          </span>
        </div>
      </div>

      {quoteLoading && <p className="font-mono text-sm text-paper/60">Reading the tape…</p>}
      {quoteError && !quoteLoading && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-stamp-sell">{quoteError}</p>
          <button
            type="button"
            onClick={() => setQuoteRetryNonce((n) => n + 1)}
            className="rounded-sm border border-stamp-sell/50 px-3 py-1 font-mono text-xs uppercase tracking-wide text-stamp-sell hover:bg-stamp-sell/10"
          >
            Try again
          </button>
        </div>
      )}

      {quote && !quoteLoading && (
        <>
          <div className="flex flex-wrap items-baseline gap-3 font-mono tabular-nums">
            <span className="text-2xl text-paper sm:text-3xl">${quote.latest_close}</span>
            <span className={quote.percent_change >= 0 ? "text-stamp-buy" : "text-stamp-sell"}>
              {quote.percent_change >= 0 ? "+" : ""}
              {quote.percent_change}%
            </span>
            <span className="text-xs text-paper/50">as of {quote.latest_date}</span>
          </div>

          <PriceChart ticker={ticker} timeSeries={quote.time_series} />
        </>
      )}

      {analysisLoading && (
        <p className="font-mono text-sm text-paper/60">Consulting the analyst…</p>
      )}
      {analysisError && !analysisLoading && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-stamp-sell">{analysisError}</p>
          <button
            type="button"
            onClick={() => setAnalysisRetryNonce((n) => n + 1)}
            className="rounded-sm border border-stamp-sell/50 px-3 py-1 font-mono text-xs uppercase tracking-wide text-stamp-sell hover:bg-stamp-sell/10"
          >
            Try again
          </button>
        </div>
      )}
      {analysis && !analysisLoading && (
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <VerdictStamp
            recommendation={analysis.verdict.recommendation}
            sentiment={analysis.verdict.sentiment}
          />
          <div className="flex-1 font-body text-sm text-paper/85">
            <AnalysisMarkdown>{analysis.analysis}</AnalysisMarkdown>
          </div>
        </div>
      )}

      <div>
        <h4 className="mb-2 font-display text-sm uppercase tracking-widest text-paper/60">
          Latest Headlines
        </h4>
        {news ? <NewsList articles={news} /> : (
          <p className="text-sm text-paper/50">Loading headlines…</p>
        )}
      </div>
    </div>
  );
}
