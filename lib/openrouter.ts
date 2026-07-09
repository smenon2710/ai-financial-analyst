import type { StockData } from "./stockData";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function chatCompletion(messages: ChatMessage[], temperature = 0.7): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openrouter/free";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // Identifies this app in OpenRouter's dashboard/activity logs, so calls
      // are attributable even if the key is shared across multiple apps.
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
      "X-Title": "AI Financial Analyst",
    },
    body: JSON.stringify({ model, messages, temperature }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error?.message || res.statusText;
    throw new Error(`OpenRouter error (${res.status}): ${message}`);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty response.");
  }
  return content as string;
}

export async function generateAnalysis(ticker: string, stockData: StockData): Promise<string> {
  const entries = Object.entries(stockData.time_series);
  const downsampled = Object.fromEntries(entries.filter((_, i) => i % 5 === 0));

  const prompt = `You are a financial analyst AI. Given historical stock price data, generate a clear, concise analysis of the stock's recent performance.

Stock: ${ticker}
Latest Close: ${stockData.latest_close}
Previous Close: ${stockData.prev_close}
Percent Change: ${stockData.percent_change}%

Historical Close Prices (sampled):
${JSON.stringify(downsampled)}

Instructions:
1. Summarize the trend (upward, downward, volatile).
2. Mention any notable price spikes or dips.
3. Suggest whether sentiment is Positive, Neutral, or Negative.
4. End with a Recommendation: Buy, Hold, or Sell.
Format output clearly.`;

  return chatCompletion([
    { role: "system", content: "You are a helpful AI financial analyst." },
    { role: "user", content: prompt },
  ]);
}

export interface StockIdea {
  ticker: string;
  name: string;
  reason: string;
}

export async function getStockIdeas(theme: string): Promise<StockIdea[]> {
  const prompt = `As a financial research assistant, list 4 real publicly traded companies that fit the investment theme: "${theme}".

Aim for a mix, not just the most famous names:
- At most 1-2 should be large, well-known companies where this theme is only one part of their business.
- At least 2 should be more specific, less obvious "pure-play" companies whose business is closely tied to this exact theme.
Avoid defaulting to the same handful of mega-cap generalists that show up for almost any tech-adjacent theme, unless they are genuinely among the most direct plays on this specific theme.

For each, include:
- Ticker
- Company name
- One-line reason why it's relevant to the theme

Respond with ONLY a JSON array in this exact format, no prose before or after:
[
  { "ticker": "AAPL", "name": "Apple Inc.", "reason": "..." }
]`;

  const content = await chatCompletion([
    { role: "system", content: "You are a stock-picking AI. You always respond with valid JSON only, no markdown fences." },
    { role: "user", content: prompt },
  ]);

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse stock ideas: no JSON array found in the model response.");
  }
  return JSON.parse(jsonMatch[0]);
}
