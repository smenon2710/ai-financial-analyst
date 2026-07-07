"use client";

import { useState, type FormEvent } from "react";
import { LedgerTabs } from "@/components/LedgerTabs";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import type { StockIdea } from "@/lib/openrouter";

type TabId = "discover" | "analyze";

export default function Home() {
  const [tab, setTab] = useState<TabId>("discover");

  const [theme, setTheme] = useState("");
  const [ideas, setIdeas] = useState<StockIdea[] | null>(null);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState<string | null>(null);
  const [selectedIdeaTicker, setSelectedIdeaTicker] = useState<string | null>(null);

  const [tickerInput, setTickerInput] = useState("");
  const [activeTicker, setActiveTicker] = useState<string | null>(null);

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
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brass">Ledger No. 01</p>
        <h1 className="mt-2 font-display text-4xl italic text-paper sm:text-5xl">
          AI Financial Analyst
        </h1>
        <p className="mt-3 max-w-xl text-paper/70">
          Enter a ticker or a theme. Get a stamped verdict — Buy, Hold, or Sell — backed by price
          history and the latest headlines.
        </p>
      </header>

      <LedgerTabs
        tabs={[
          { id: "discover", label: "Find Stocks to Buy" },
          { id: "analyze", label: "Analyze a Specific Stock" },
        ]}
        active={tab}
        onChange={(id) => setTab(id as TabId)}
      />

      <div className="rounded-b-sm rounded-tr-sm border border-t-0 border-paper/15 bg-paper/[0.02] p-6">
        {tab === "discover" && (
          <div className="space-y-6">
            <form onSubmit={findStocks} className="flex flex-wrap gap-3">
              <input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. AI, biotech, green energy"
                className="min-w-[240px] flex-1 rounded-sm border border-paper/20 bg-ink px-4 py-2.5 text-paper placeholder:text-paper/40"
              />
              <button
                type="submit"
                disabled={ideasLoading}
                className="rounded-sm bg-brass px-5 py-2.5 font-display text-sm text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {ideasLoading ? "Searching…" : "Find Stocks"}
              </button>
            </form>

            {ideasError && <p className="text-sm text-stamp-sell">{ideasError}</p>}

            {ideas && (
              <ul className="space-y-3">
                {ideas.map((idea) => (
                  <li key={idea.ticker} className="rounded-sm border border-paper/15 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-base text-paper">
                          <span className="font-mono text-brass">{idea.ticker}</span> — {idea.name}
                        </p>
                        <p className="mt-1 text-sm text-paper/70">{idea.reason}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedIdeaTicker(
                            selectedIdeaTicker === idea.ticker ? null : idea.ticker
                          )
                        }
                        className="rounded-sm border border-brass/50 px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-brass hover:bg-brass/10"
                      >
                        {selectedIdeaTicker === idea.ticker ? "Close" : "Analyze"}
                      </button>
                    </div>
                    {selectedIdeaTicker === idea.ticker && (
                      <div className="mt-4">
                        <AnalysisPanel ticker={idea.ticker} showNews={false} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "analyze" && (
          <div className="space-y-6">
            <form onSubmit={analyzeTicker} className="flex flex-wrap gap-3">
              <input
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
                placeholder="e.g. AAPL"
                className="min-w-[160px] flex-1 rounded-sm border border-paper/20 bg-ink px-4 py-2.5 uppercase text-paper placeholder:text-paper/40 sm:flex-none"
              />
              <button
                type="submit"
                className="rounded-sm bg-brass px-5 py-2.5 font-display text-sm text-ink transition-opacity hover:opacity-90"
              >
                Analyze
              </button>
            </form>

            {activeTicker && (
              <AnalysisPanel key={activeTicker} ticker={activeTicker} showNews />
            )}
          </div>
        )}
      </div>

      <footer className="mt-12 border-t border-paper/10 pt-6">
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
