from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

# Choose data provider: "yfinance" or "alphavantage"
DATA_PROVIDER = os.getenv("DATA_PROVIDER", "yfinance")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")


print("Using data provider:", DATA_PROVIDER) #test debug


