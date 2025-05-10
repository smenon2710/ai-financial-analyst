
import os
from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

# You can override this via .env if needed
GPT_MODEL = os.getenv("GPT_MODEL", "gpt-3.5-turbo")

def generate_analysis(ticker, stock_data):
    # Downsample time series to reduce token usage (1 out of every 5 points)
    time_series = stock_data["time_series"]
    downsampled = {k: v for i, (k, v) in enumerate(time_series.items()) if i % 5 == 0}

    prompt = f"""
You are a financial analyst AI. Given historical stock price data, generate a clear, concise analysis of the stock's recent performance.

Stock: {ticker}
Latest Close: {stock_data["latest_close"]}
Previous Close: {stock_data["prev_close"]}
Percent Change: {stock_data["percent_change"]}%

Historical Close Prices (sampled):
{downsampled}

Instructions:
1. Summarize the trend (upward, downward, volatile).
2. Mention any notable price spikes or dips.
3. Suggest whether sentiment is Positive, Neutral, or Negative.
4. End with a Recommendation: Buy, Hold, or Sell.
Format output clearly.
"""

    response = client.chat.completions.create(
        model=GPT_MODEL,
        messages=[
            {"role": "system", "content": "You are a helpful AI financial analyst."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
    )

    return response.choices[0].message.content

def get_stock_ideas(theme):
    prompt = f"""
As a financial research assistant, list 4 real publicly traded companies that fit the investment theme: "{theme}".

For each, include:
- Ticker
- Company name
- One-line reason why it's relevant to the theme

Output in this format:
[
  {{ "ticker": "AAPL", "name": "Apple Inc.", "reason": "..." }},
  ...
]
"""

    response = client.chat.completions.create(
        model=GPT_MODEL,
        messages=[
            {"role": "system", "content": "You are a stock-picking AI."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7
    )

    try:
        import json
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"error": f"Failed to parse response: {e}"}
