import type { Recommendation, Sentiment } from "@/lib/verdict";

const COLORS: Record<Recommendation, string> = {
  Buy: "border-stamp-buy text-stamp-buy",
  Hold: "border-stamp-hold text-stamp-hold",
  Sell: "border-stamp-sell text-stamp-sell",
  "N/A": "border-paper/40 text-paper/60",
};

export function VerdictStamp({
  recommendation,
  sentiment,
}: {
  recommendation: Recommendation;
  sentiment: Sentiment;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`animate-stamp -rotate-[4deg] select-none rounded-sm border-[3px] px-6 py-3 text-center font-display text-2xl font-semibold uppercase tracking-[0.2em] ${COLORS[recommendation]}`}
        style={{ boxShadow: "0 0 10px 0 currentColor" }}
      >
        {recommendation}
      </div>
      <span className="font-mono text-xs uppercase tracking-widest text-paper/60">
        Sentiment: {sentiment}
      </span>
      <span className="max-w-[16rem] text-center text-[0.65rem] leading-snug text-paper/40">
        AI-generated, not financial advice. Consult a licensed advisor before investing.
      </span>
    </div>
  );
}
