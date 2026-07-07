import YahooFinance from "yahoo-finance2";
import type { Period } from "./periods";

export type { Period } from "./periods";

const yahooFinance = new YahooFinance();

export interface StockData {
  latest_date: string;
  latest_close: number;
  prev_close: number;
  percent_change: number;
  time_series: Record<string, number>;
}

const PERIOD_TO_DAYS: Record<Period, number> = {
  "1mo": 30,
  "3mo": 90,
  "6mo": 182,
  "1y": 365,
  "2y": 730,
  "5y": 1825,
  max: 20 * 365,
};

type ChartInterval = "1d" | "1wk";

/** Yahoo occasionally fails crumb/cookie negotiation on the first request per
 * cold instance; a quick retry clears up most of these transient failures. */
async function chartWithRetry(
  ticker: string,
  opts: { period1: Date; interval: ChartInterval },
  attempts = 2
) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await yahooFinance.chart(ticker, opts);
    } catch (e) {
      lastError = e;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }
  }
  throw lastError;
}

function friendlyFetchError(ticker: string, e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  const lower = raw.toLowerCase();

  if (lower.includes("crumb") || lower.includes("cookie")) {
    return "Yahoo Finance is temporarily unavailable. Please try again in a moment.";
  }
  if (lower.includes("429") || lower.includes("too many requests")) {
    return "Yahoo Finance rate-limited this request. Please wait a moment and try again.";
  }
  if (lower.includes("not found")) {
    return `No data found for "${ticker}". Check the ticker symbol.`;
  }
  return `Couldn't fetch price data for "${ticker}" right now. Please try again shortly.`;
}

export async function fetchStockData(
  ticker: string,
  period: Period = "1mo"
): Promise<StockData | { error: string }> {
  const days = PERIOD_TO_DAYS[period] ?? 30;
  const period1 = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const interval: ChartInterval = period === "5y" || period === "max" ? "1wk" : "1d";

  try {
    const result = await chartWithRetry(ticker, { period1, interval });
    const quotes = (result.quotes ?? []).filter(
      (q): q is typeof q & { close: number } => q.close != null
    );

    if (quotes.length < 2) {
      return { error: `No data found for "${ticker}". Check the ticker symbol.` };
    }

    const latest = quotes[quotes.length - 1];
    const prev = quotes[quotes.length - 2];
    const latestClose = latest.close;
    const prevClose = prev.close;
    const percentChange = Math.round(((latestClose - prevClose) / prevClose) * 10000) / 100;

    const time_series: Record<string, number> = {};
    for (const q of quotes) {
      time_series[q.date.toISOString().slice(0, 10)] = Math.round(q.close * 100) / 100;
    }

    return {
      latest_date: latest.date.toISOString().slice(0, 10),
      latest_close: Math.round(latestClose * 100) / 100,
      prev_close: Math.round(prevClose * 100) / 100,
      percent_change: percentChange,
      time_series,
    };
  } catch (e) {
    console.error(`[stockData] fetchStockData(${ticker}, ${period}) failed:`, e);
    return { error: friendlyFetchError(ticker, e) };
  }
}
