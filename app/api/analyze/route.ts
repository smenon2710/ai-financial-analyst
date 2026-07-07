import { NextRequest, NextResponse } from "next/server";
import { fetchStockData, type Period } from "@/lib/stockData";
import { generateAnalysis } from "@/lib/openrouter";
import { extractVerdict } from "@/lib/verdict";
import { withCache } from "@/lib/cache";

const CACHE_TTL_MS = 5 * 60 * 1000;

class StockDataError extends Error {}

export async function POST(req: NextRequest) {
  const { ticker, period } = (await req.json()) as { ticker?: string; period?: Period };

  if (!ticker) {
    return NextResponse.json({ error: "A ticker symbol is required." }, { status: 400 });
  }

  const symbol = ticker.toUpperCase();
  const resolvedPeriod = period ?? "1mo";
  const cacheKey = `analyze:${symbol}:${resolvedPeriod}`;

  try {
    // Caches the full result (price data + LLM analysis) so repeat views of the
    // same ticker/period — reopening a Discover idea, flipping tabs, etc. —
    // don't burn another LLM call within the TTL window.
    const payload = await withCache(cacheKey, CACHE_TTL_MS, async () => {
      const stockData = await fetchStockData(symbol, resolvedPeriod);
      if ("error" in stockData) {
        throw new StockDataError(stockData.error);
      }

      const analysis = await generateAnalysis(symbol, stockData);
      const verdict = extractVerdict(analysis);
      return { stockData, analysis, verdict };
    });

    return NextResponse.json(payload);
  } catch (e) {
    if (e instanceof StockDataError) {
      return NextResponse.json({ error: e.message }, { status: 422 });
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate analysis." },
      { status: 502 }
    );
  }
}
