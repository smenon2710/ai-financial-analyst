import { NextRequest, NextResponse } from "next/server";
import { fetchStockData } from "@/lib/stockData";
import { generateAnalysis } from "@/lib/openrouter";
import { extractVerdict } from "@/lib/verdict";
import { withCache } from "@/lib/cache";

const CACHE_TTL_MS = 5 * 60 * 1000;

// Fixed window for the LLM narrative, independent of whatever period the
// user has the chart set to — so switching chart periods never re-spends
// an LLM call. 3 months gives enough trend context without a huge prompt.
const ANALYSIS_PERIOD = "3mo";

class StockDataError extends Error {}

export async function POST(req: NextRequest) {
  const { ticker } = (await req.json()) as { ticker?: string };

  if (!ticker) {
    return NextResponse.json({ error: "A ticker symbol is required." }, { status: 400 });
  }

  const symbol = ticker.toUpperCase();
  const cacheKey = `analyze:${symbol}`;

  try {
    // Caches the LLM result per ticker (not per period) so repeat views —
    // reopening a Discover idea, switching chart periods, etc. — don't burn
    // another LLM call within the TTL window.
    const payload = await withCache(cacheKey, CACHE_TTL_MS, async () => {
      const stockData = await fetchStockData(symbol, ANALYSIS_PERIOD);
      if ("error" in stockData) {
        throw new StockDataError(stockData.error);
      }

      const analysis = await generateAnalysis(symbol, stockData);
      const verdict = extractVerdict(analysis);
      return { analysis, verdict };
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
