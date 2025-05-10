
import yfinance as yf
import requests
from config import ALPHA_VANTAGE_API_KEY, DATA_PROVIDER

def fetch_stock_data(ticker, period="1mo"):
    if DATA_PROVIDER == "alphavantage":
        return get_data_from_alpha_vantage(ticker)
    else:
        return get_data_from_yfinance(ticker, period)

def get_data_from_yfinance(ticker, period="1mo"):
    try:
        ticker_data = yf.Ticker(ticker)
        hist = ticker_data.history(period=period)

        if hist.empty:
            return {"error": "No data found for ticker."}

        latest_date = hist.index[-1].strftime("%Y-%m-%d")
        latest_close = hist["Close"].iloc[-1]
        prev_close = hist["Close"].iloc[-2]
        percent_change = round(((latest_close - prev_close) / prev_close) * 100, 2)
        time_series = {d.strftime("%Y-%m-%d"): float(c) for d, c in zip(hist.index, hist["Close"])}

        return {
            "latest_date": latest_date,
            "latest_close": round(latest_close, 2),
            "prev_close": round(prev_close, 2),
            "percent_change": percent_change,
            "time_series": time_series
        }
    except Exception as e:
        return {"error": f"yfinance error: {e}"}

def get_data_from_alpha_vantage(ticker):
    url = "https://www.alphavantage.co/query"
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": ticker,
        "outputsize": "compact",
        "apikey": ALPHA_VANTAGE_API_KEY
    }
    response = requests.get(url, params=params)
    data = response.json()

    if "Error Message" in data:
        return {"error": f"API Error: {data['Error Message']}"}
    if "Note" in data:
        return {"error": f"Rate limit hit: {data['Note']}"}
    if "Information" in data:
        return {"error": f"Restricted access: {data['Information']}"}

    try:
        ts = data["Time Series (Daily)"]
        sorted_dates = sorted(ts.keys(), reverse=True)
        latest = sorted_dates[0]
        previous = sorted_dates[1]

        latest_close = float(ts[latest]["4. close"])
        prev_close = float(ts[previous]["4. close"])
        percent_change = round(((latest_close - prev_close) / prev_close) * 100, 2)

        return {
            "latest_date": latest,
            "latest_close": latest_close,
            "prev_close": prev_close,
            "percent_change": percent_change,
            "time_series": {date: float(ts[date]["4. close"]) for date in sorted_dates[:180]}
        }

    except KeyError:
        return {"error": "Unexpected data format from API."}
