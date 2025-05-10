import requests
from config import NEWS_API_KEY

def get_latest_news(ticker):
    url = f"https://newsdata.io/api/1/news?apikey={NEWS_API_KEY}&q={ticker}&language=en&category=business"
    try:
        response = requests.get(url)
        articles = response.json().get("results", [])[:5]
        return articles
    except Exception as e:
        return [{"title": "News fetch failed", "description": str(e)}]
