"use client";

import { useState, type FormEvent } from "react";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import type { StockIdea } from "@/lib/openrouter";
import { useWatchlist } from "@/lib/watchlist";

export default function Home() {
  const { tickers: watchlistTickers, add: addToWatchlist, remove: removeFromWatchlist } =
    useWatchlist();
  const [selectedWatchlistTicker, setSelectedWatchlistTicker] = useState<string | null>(null);

  function toggleWatchlist(ticker: string) {
    if (watchlistTickers.includes(ticker)) {
      removeFromWatchlist(ticker);
    } else {
      addToWatchlist(ticker);
    }
  }

  const [theme, setTheme] = useState("");
  const [ideas, setIdeas] = useState<StockIdea[] | null>(null);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState<string | null>(null);
  const [selectedIdeaTicker, setSelectedIdeaTicker] = useState<string | null>(null);

  const [tickerInput, setTickerInput] = useState("");
  const [activeTicker, setActiveTicker] = useState<string | null>(null);

  const [watchlistInput, setWatchlistInput] = useState("");

  function addTickerToWatchlist(e: FormEvent) {
    e.preventDefault();
    if (!watchlistInput.trim()) return;
    addToWatchlist(watchlistInput.trim().toUpperCase());
    setWatchlistInput("");
  }

  async function findStocks(e: FormEvent) {
    e.preventDefault();
    if (!theme.trim()) return;
    setIdeasLoading(true);
    setIdeasError(null);
    setIdeas(null);
    setSelectedIdeaTicker(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch stock ideas.");
      setIdeas(data.ideas);
    } catch (err) {
      setIdeasError(err instanceof Error ? err.message : "Failed to fetch stock ideas.");
    } finally {
      setIdeasLoading(false);
    }
  }

  function analyzeTicker(e: FormEvent) {
    e.preventDefault();
    if (!tickerInput.trim()) return;
    setActiveTicker(tickerInput.trim().toUpperCase());
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-[max(2.5rem,env(safe-area-inset-top))] sm:px-6 sm:pt-16">
      <header className="mb-10 sm:mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brass">Ledger No. 01</p>
        <h1 className="mt-2 font-display text-4xl italic text-paper sm:text-5xl">
          AI Financial Analyst
        </h1>
        <p className="mt-3 max-w-xl text-paper/70">
          Enter a ticker or a theme. Get a stamped verdict — Buy, Hold, or Sell — backed by price
          history and the latest headlines.
        </p>
      </header>

      <div className="divide-y divide-brass-dim/25 border-y border-brass-dim/25">
        <section className="py-8">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-lg text-paper">Watchlist</h2>
            {watchlistTickers.length > 0 && (
              <span className="font-mono text-xs text-paper/40">{watchlistTickers.length}</span>
            )}
          </div>

          <form onSubmit={addTickerToWatchlist} className="mb-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={watchlistInput}
              onChange={(e) => setWatchlistInput(e.target.value)}
              placeholder="e.g. AAPL — just track it, no analysis"
              className="w-full rounded-sm border border-paper/20 bg-ink px-4 py-3 uppercase text-paper placeholder:text-paper/40 sm:flex-1"
            />
            <button
              type="submit"
              className="w-full shrink-0 rounded-sm border border-brass/50 px-5 py-3 font-display text-sm text-brass transition-colors hover:bg-brass/10 sm:w-auto"
            >
              Add to Watchlist
            </button>
          </form>

          {watchlistTickers.length === 0 ? (
            <p className="text-sm text-paper/50">
              Add a ticker above, or star one from any analysis below, to pin it here.
            </p>
          ) : (
            <ul className="divide-y divide-paper/10">
              {watchlistTickers.map((ticker) => (
                <li key={ticker} className="py-3 first:pt-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-baseline gap-2 overflow-hidden">
                      <span className="font-mono text-brass">{ticker}</span>
                      <span className="h-px flex-1 border-b border-dotted border-paper/20" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedWatchlistTicker(
                            selectedWatchlistTicker === ticker ? null : ticker
                          )
                        }
                        className="rounded-sm border border-brass/50 px-3 py-2 font-mono text-xs uppercase tracking-wide text-brass hover:bg-brass/10"
                      >
                        {selectedWatchlistTicker === ticker ? "Close" : "Analyze"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromWatchlist(ticker)}
                        aria-label={`Remove ${ticker} from watchlist`}
                        className="rounded-sm border border-paper/20 px-3 py-2 font-mono text-xs text-paper/50 transition-colors hover:border-stamp-sell/50 hover:text-stamp-sell"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {selectedWatchlistTicker === ticker && (
                    <div className="mt-4">
                      <AnalysisPanel
                        ticker={ticker}
                        isWatchlisted={watchlistTickers.includes(ticker)}
                        onToggleWatchlist={() => toggleWatchlist(ticker)}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="py-8">
          <h2 className="mb-4 font-display text-lg text-paper">Find Stocks to Buy</h2>
          <div className="space-y-6">
            <form onSubmit={findStocks} className="flex flex-col gap-3 sm:flex-row">
              <input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. AI, biotech, green energy"
                className="w-full rounded-sm border border-paper/20 bg-ink px-4 py-3 text-paper placeholder:text-paper/40 sm:flex-1"
              />
              <button
                type="submit"
                disabled={ideasLoading}
                className="w-full shrink-0 rounded-sm bg-brass px-5 py-3 font-display text-sm text-ink transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
              >
                {ideasLoading ? "Searching…" : "Find Stocks"}
              </button>
            </form>

            {ideasError && <p className="text-sm text-stamp-sell">{ideasError}</p>}

            {ideas && ideas.length === 0 && (
              <p className="text-sm text-paper/50">
                No verified matches for that theme — try rephrasing it.
              </p>
            )}

            {ideas && ideas.length > 0 && (
              <ul className="divide-y divide-paper/10">
                {ideas.map((idea) => (
                  <li key={idea.ticker} className="py-3 first:pt-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline">
                      <div className="flex-1 overflow-hidden">
                        <span className="font-mono text-brass">{idea.ticker}</span>
                        <span className="text-paper"> — {idea.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedIdeaTicker(
                            selectedIdeaTicker === idea.ticker ? null : idea.ticker
                          )
                        }
                        className="shrink-0 self-start rounded-sm border border-brass/50 px-3 py-2 font-mono text-xs uppercase tracking-wide text-brass hover:bg-brass/10 sm:self-auto"
                      >
                        {selectedIdeaTicker === idea.ticker ? "Close" : "Analyze"}
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-paper/60">{idea.reason}</p>
                    {selectedIdeaTicker === idea.ticker && (
                      <div className="mt-4">
                        <AnalysisPanel
                          ticker={idea.ticker}
                          isWatchlisted={watchlistTickers.includes(idea.ticker)}
                          onToggleWatchlist={() => toggleWatchlist(idea.ticker)}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="py-8">
          <h2 className="mb-4 font-display text-lg text-paper">Analyze a Ticker</h2>
          <div className="space-y-6">
            <form onSubmit={analyzeTicker} className="flex flex-col gap-3 sm:flex-row">
              <input
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
                placeholder="e.g. AAPL"
                className="w-full rounded-sm border border-paper/20 bg-ink px-4 py-3 uppercase text-paper placeholder:text-paper/40 sm:flex-1"
              />
              <button
                type="submit"
                className="w-full shrink-0 rounded-sm bg-brass px-5 py-3 font-display text-sm text-ink transition-opacity hover:opacity-90 sm:w-auto"
              >
                Analyze
              </button>
            </form>

            {activeTicker && (
              <AnalysisPanel
                key={activeTicker}
                ticker={activeTicker}
                isWatchlisted={watchlistTickers.includes(activeTicker)}
                onToggleWatchlist={() => toggleWatchlist(activeTicker)}
              />
            )}
          </div>
        </section>
      </div>

      <footer className="mt-10 pb-[env(safe-area-inset-bottom)] pt-6">
        <p className="max-w-xl font-mono text-xs leading-relaxed text-paper/40">
          Disclaimer: all analysis, verdicts, and stock ideas on this page are generated by an AI
          model and may be inaccurate, outdated, or wrong. This is not financial advice. Do your
          own research and consult a licensed financial advisor before making any investment
          decisions.
        </p>
      </footer>
    </main>
  );
}
