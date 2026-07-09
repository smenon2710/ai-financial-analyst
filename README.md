# 📊 AI Financial Analyst

A Next.js app that helps you:

- 🔍 Analyze individual stocks with AI-generated insights (via OpenRouter)
- 🧠 Get buy/sell/hold recommendations, stamped like an analyst's ledger
- 📈 Visualize historical price trends (via Yahoo Finance)
- 🗞️ See real-time news headlines related to any stock you find or analyze
- 🎯 Discover potential stock picks by sector/theme, verified against real tickers
- ⭐ Keep a personal watchlist — pin a ticker instantly (no analysis required) or star it after analyzing
- 📲 Installable as a PWA — add it to your phone's home screen straight from the browser
- ⚠️ Shows a plain-language disclaimer alongside every verdict — this is AI-generated commentary, not financial advice

---

## 🚀 Getting Started

Requires **Node 22+** (`yahoo-finance2` warns and may behave unexpectedly on older Node versions).

```bash
git clone https://github.com/smenon2710/ai-financial-analyst.git
cd ai-financial-analyst
npm install
cp .env.example .env.local   # then fill in OPENROUTER_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```
ai-financial-analyst/
├── app/
│   ├── layout.tsx               # fonts, PWA/apple-web-app metadata, service worker registration
│   ├── page.tsx                 # single page: watchlist + theme discovery + ticker analysis
│   ├── manifest.ts               # PWA manifest (Next.js metadata file convention)
│   ├── apple-icon.png            # iOS home-screen icon (Next.js auto-detected convention)
│   ├── globals.css
│   └── api/
│       ├── quote/route.ts       # price data only (Yahoo, no LLM) — driven by chart period
│       ├── analyze/route.ts     # LLM analysis + verdict per ticker (cached, period-independent)
│       ├── ideas/route.ts       # LLM stock ideas by theme (cached, ticker-validated)
│       └── news/route.ts        # Google News RSS per ticker
├── components/
│   ├── AnalysisPanel.tsx
│   ├── AnalysisMarkdown.tsx      # renders LLM output, incl. GFM tables
│   ├── VerdictStamp.tsx
│   ├── PriceChart.tsx
│   ├── NewsList.tsx
│   └── ServiceWorkerRegister.tsx # registers public/sw.js on mount
├── lib/
│   ├── openrouter.ts    # OpenRouter chat completion calls
│   ├── stockData.ts     # yahoo-finance2 price history + lightweight ticker existence check
│   ├── news.ts           # Google News RSS fetch/parse
│   ├── verdict.ts        # sentiment/recommendation extraction
│   ├── periods.ts        # shared client-safe period constants
│   ├── watchlist.ts      # localStorage-backed watchlist hook (client-side, no backend)
│   └── cache.ts          # in-memory TTL cache (see Notes below)
├── public/
│   ├── icon-192.png, icon-512.png, icon-maskable-512.png   # PWA icons
│   └── sw.js              # minimal installable-only service worker (no caching)
├── package.json
└── README.md
```

---

## 🔐 Environment Variables

```
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=openrouter/free

# Optional — shown as this app's identity in OpenRouter's dashboard/logs
APP_URL=http://localhost:3000
```

`.env.local` is gitignored — never commit real keys. Rotate a key immediately if it's ever pasted somewhere shared (chat, issue, PR).

---

## 📝 Notes

- **LLM calls are decoupled from chart period**: `/api/quote` fetches price/chart data (free, Yahoo) for whatever period the user has selected, with no LLM involved. `/api/analyze` generates the narrative + verdict once per ticker, always from a fixed 3-month window, regardless of the chart's period — so flipping through 1mo/3mo/1y/5y on the same ticker costs a single LLM call, not one per period.
- **LLM call caching**: `/api/analyze` (5 min TTL, keyed per ticker) and `/api/ideas` (10 min TTL, keyed per theme) cache results in-memory per warm server instance, so re-viewing the same ticker or theme doesn't re-spend an LLM call. Resets on cold start/restart — that's expected, not a bug.
- **Stock ideas are quality-checked, not just generated**: the `/api/ideas` prompt asks for a mix of well-known leaders *and* lesser-known pure-plays (instead of defaulting to the same mega-caps for every theme), and every returned ticker is verified against a live Yahoo Finance quote before being shown — hallucinated tickers are silently dropped. Both checks are free (no added LLM/API cost).
- **Watchlist is entirely client-side**: tickers are stored in `localStorage` (`lib/watchlist.ts`), not on any server — adding, starring, or removing a ticker never costs an API or LLM call. You can pin a ticker directly (e.g. one you bought elsewhere) without ever running analysis on it.
- **PWA install**: the app ships a manifest, icon set, and a minimal service worker so Chrome/Android show the native "Install app" prompt once it's served over HTTPS (e.g. on Vercel). The service worker intentionally does **not** cache anything — every screen depends on live prices/news, so caching would risk showing stale data as current. iOS Safari has no programmatic install prompt; users add it via Share → Add to Home Screen.
- **Markdown tables render properly**: `AnalysisMarkdown` uses `remark-gfm` so pipe-table syntax in LLM output renders as an actual styled table (with horizontal scroll on narrow screens) instead of raw pipe-delimited text.
- **Yahoo Finance errors**: transient crumb/cookie failures get one automatic retry; remaining failures surface as a plain-language message with a "Try again" button, while the raw error is logged server-side for debugging.

---

## ☁️ Deploying to Vercel

1. Push this repo to GitHub (already done: `smenon2710/ai-financial-analyst`).
2. Import the repo at [vercel.com/new](https://vercel.com/new) — Next.js is auto-detected.
3. Add `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, and `APP_URL` (your deployed URL) under Project Settings → Environment Variables.
4. Set the Node.js version to 22.x under Project Settings → General.
5. Deploy.

---

## 📜 License

MIT
