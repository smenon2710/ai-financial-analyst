import { NextRequest, NextResponse } from "next/server";
import { getStockIdeas } from "@/lib/openrouter";
import { tickerExists } from "@/lib/stockData";
import { withCache } from "@/lib/cache";

const CACHE_TTL_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  const { theme } = (await req.json()) as { theme?: string };

  if (!theme) {
    return NextResponse.json({ error: "A sector or theme is required." }, { status: 400 });
  }

  const cacheKey = `ideas:${theme.trim().toLowerCase()}`;

  try {
    // Same theme searched again within the TTL window reuses the last result
    // instead of spending another LLM call on it.
    const ideas = await withCache(cacheKey, CACHE_TTL_MS, async () => {
      const rawIdeas = await getStockIdeas(theme);
      // The LLM occasionally hallucinates a ticker; drop anything that
      // doesn't resolve to a real security (free Yahoo lookup, no LLM cost).
      const exists = await Promise.all(rawIdeas.map((idea) => tickerExists(idea.ticker)));
      return rawIdeas.filter((_, i) => exists[i]);
    });
    return NextResponse.json({ ideas });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch stock ideas." },
      { status: 502 }
    );
  }
}
