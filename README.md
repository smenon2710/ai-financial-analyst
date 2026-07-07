# 📊 AI Financial Analyst

A Next.js app that helps you:

- 🔍 Analyze individual stocks with AI-generated insights (via OpenRouter)
- 🧠 Get buy/sell/hold recommendations, stamped like an analyst's ledger
- 📈 Visualize historical price trends (via Yahoo Finance)
- 🗞️ See real-time news headlines related to any stock
- 🎯 Discover potential stock picks by sector/theme
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
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       ├── analyze/route.ts    # price data + LLM analysis (cached)
│       ├── ideas/route.ts      # LLM stock ideas by theme (cached)
│       └── news/route.ts       # Google News RSS per ticker
├── components/
│   ├── AnalysisPanel.tsx
│   ├── AnalysisMarkdown.tsx
│   ├── VerdictStamp.tsx
│   ├── PriceChart.tsx
│   ├── LedgerTabs.tsx
│   └── NewsList.tsx
├── lib/
│   ├── openrouter.ts   # OpenRouter chat completion calls
│   ├── stockData.ts    # yahoo-finance2 price history
│   ├── news.ts          # Google News RSS fetch/parse
│   ├── verdict.ts       # sentiment/recommendation extraction
│   ├── periods.ts       # shared client-safe period constants
│   └── cache.ts         # in-memory TTL cache (see Notes below)
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

- **LLM call caching**: `/api/analyze` (5 min TTL) and `/api/ideas` (10 min TTL) cache full results in-memory per warm server instance, so re-viewing the same ticker/period or theme doesn't re-spend an LLM call. Resets on cold start/restart — that's expected, not a bug.
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
