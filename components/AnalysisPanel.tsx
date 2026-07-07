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
  stockData: StockData;
  analysis: string;
  verdict: { sentiment: Sentiment; recommendation: Recommendation };
}

export function AnalysisPanel({ ticker, showNews }: { ticker: string; showNews: boolean }) {
  const [period, setPeriod] = useState<Period>("1mo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [news, setNews] = useState<NewsArticle[] | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker, period }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Analysis failed.");
        if (!cancelled) setResult(data);

        if (showNews) {
          const newsRes = await fetch(`/api/news?ticker=${encodeURIComponent(ticker)}`);
          const newsData = await newsRes.json();
          if (!cancelled) setNews(newsData.articles ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, period, showNews, retryNonce]);

  return (
    <div className="space-y-6 rounded-sm border border-paper/15 bg-paper/[0.03] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg text-paper">{ticker}</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="rounded-sm border border-paper/20 bg-ink px-3 py-1.5 font-mono text-xs text-paper"
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="font-mono text-sm text-paper/60">Reading the tape…</p>}
      {error && !loading && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-stamp-sell">{error}</p>
          <button
            type="button"
            onClick={() => setRetryNonce((n) => n + 1)}
            className="rounded-sm border border-stamp-sell/50 px-3 py-1 font-mono text-xs uppercase tracking-wide text-stamp-sell hover:bg-stamp-sell/10"
          >
            Try again
          </button>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex flex-wrap items-baseline gap-3 font-mono tabular-nums">
            <span className="text-3xl text-paper">${result.stockData.latest_close}</span>
            <span
              className={result.stockData.percent_change >= 0 ? "text-stamp-buy" : "text-stamp-sell"}
            >
              {result.stockData.percent_change >= 0 ? "+" : ""}
              {result.stockData.percent_change}%
            </span>
            <span className="text-xs text-paper/50">as of {result.stockData.latest_date}</span>
          </div>

          <PriceChart ticker={ticker} timeSeries={result.stockData.time_series} />

          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <VerdictStamp
              recommendation={result.verdict.recommendation}
              sentiment={result.verdict.sentiment}
            />
            <div className="flex-1 font-body text-sm text-paper/85">
              <AnalysisMarkdown>{result.analysis}</AnalysisMarkdown>
            </div>
          </div>

          {showNews && (
            <div>
              <h4 className="mb-2 font-display text-sm uppercase tracking-widest text-paper/60">
                Latest Headlines
              </h4>
              {news ? (
                <NewsList articles={news} />
              ) : (
                <p className="text-sm text-paper/50">Loading headlines…</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
