
import streamlit as st
import plotly.graph_objects as go
import re
import uuid
from agent.financial_data import fetch_stock_data
from agent.analysis_agent import generate_analysis, get_stock_ideas
from agent.news_fetcher import get_latest_news

BADGE_COLORS = {
    "Positive": "#28a745",
    "Neutral": "#ffc107",
    "Negative": "#dc3545",
    "Buy": "#28a745",
    "Hold": "#ffc107",
    "Sell": "#dc3545",
    "Default": "#6c757d"
}

def render_badge(label, color):
    return f"""<span style='
        background-color: {color};
        color: white;
        padding: 6px 12px;
        border-radius: 12px;
        font-size: 1em;
        margin: 5px;
        display: inline-block;
    '>{label}</span>"""

st.set_page_config(page_title="AI Financial Analyst", layout="centered")

st.title("📊 AI Financial Analyst")
tab1, tab2 = st.tabs(["🧭 Find Stocks to Buy", "📈 Analyze a Specific Stock"])

def extract_sentiment_and_recommendation(text):
    sentiment_match = re.search(r"sentiment.*?(Positive|Neutral|Negative)", text, re.IGNORECASE)
    recommendation_match = re.search(r"recommend.*?(Buy|Hold|Sell)", text, re.IGNORECASE)

    sentiment = sentiment_match.group(1).capitalize() if sentiment_match else "N/A"
    recommendation = recommendation_match.group(1).capitalize() if recommendation_match else "N/A"

    sentiment_color = BADGE_COLORS.get(sentiment, BADGE_COLORS["Default"])
    recommendation_color = BADGE_COLORS.get(recommendation, BADGE_COLORS["Default"])

    return sentiment, sentiment_color, recommendation, recommendation_color

def render_analysis(ticker, stock_data, period, show_news=False):
    st.subheader(f"📈 Stock Data for {ticker.upper()} on {stock_data['latest_date']}")
    st.metric("Latest Close", f"${stock_data['latest_close']}", f"{stock_data['percent_change']}%")

    dates = list(stock_data["time_series"].keys())[::-1]
    prices = list(stock_data["time_series"].values())[::-1]

    unique_chart_id = f"chart_{ticker}_{period}_{uuid.uuid4().hex[:6]}"
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=dates, y=prices, mode="lines", name=ticker.upper()))
    fig.update_layout(
        title=f"{ticker.upper()} - Last {period}",
        xaxis_title="Date",
        yaxis_title="Close Price (USD)",
        xaxis_tickangle=-45,
        xaxis_rangeslider=dict(visible=True)
    )
    st.plotly_chart(fig, use_container_width=True, key=unique_chart_id)

    with st.spinner("Generating AI analysis..."):
        analysis = generate_analysis(ticker.upper(), stock_data)

    st.subheader("🤖 AI Analysis")
    st.write(analysis)

    sentiment, sentiment_color, recommendation, recommendation_color = extract_sentiment_and_recommendation(analysis)

    st.markdown("### 🧠 Summary", unsafe_allow_html=True)
    cols = st.columns(2)
    with cols[0]:
        st.markdown(render_badge(f"Sentiment: {sentiment}", sentiment_color), unsafe_allow_html=True)
    with cols[1]:
        st.markdown(render_badge(f"Recommendation: {recommendation}", recommendation_color), unsafe_allow_html=True)

    if show_news:
        st.subheader("🗞️ Latest News")
        news = get_latest_news(ticker)
        for article in news:
            st.markdown(f"**[{article['title']}]({article.get('link', '#')})**")
            st.caption(article.get('pubDate', ''))
            st.write(article.get('description', ''))
            st.markdown("---")

with tab1:
    sector = st.text_input("Enter a sector or theme (e.g., AI, biotech, green energy):")

    if st.button("Find Stocks"):
        if sector:
            with st.spinner("Searching for promising stocks..."):
                ideas = get_stock_ideas(sector)
                if not ideas or "error" in ideas:
                    st.error("Failed to fetch stock ideas. Please try again later.")
                else:
                    st.session_state['stock_ideas'] = ideas
                    st.session_state['sector_input'] = sector
                    st.session_state['selected_stock'] = None

    ideas = st.session_state.get('stock_ideas', [])
    if ideas:
        st.subheader(f"📌 Suggested Stocks for: {st.session_state.get('sector_input', '')}")
        for stock in ideas:
            col1, col2 = st.columns([4, 1])
            with col1:
                st.markdown(f"""**[{stock['ticker']}] {stock['name']}**  
{stock['reason']}""")
            with col2:
                if st.button(f"🔍 Analyze {stock['ticker']}", key=f"analyze_{stock['ticker']}_tab1"):
                    st.session_state["selected_stock"] = stock['ticker']

            if st.session_state.get("selected_stock") == stock["ticker"]:
                period = st.selectbox("Select time range", ["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"], key=f"range_{stock['ticker']}")
                with st.spinner(f"Analyzing {stock['ticker']}..."):
                    stock_data = fetch_stock_data(stock["ticker"], period)
                    if "error" in stock_data:
                        st.error(stock_data["error"])
                    else:
                        render_analysis(stock["ticker"], stock_data, period, show_news=False)
        st.divider()

with tab2:
    ticker = st.text_input("Enter a stock ticker (e.g., AAPL):", key="manual_ticker")
    period = st.selectbox("Select time range", ["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"], key="manual_range")

    if st.button("Analyze", key="manual_analyze"):
        if ticker:
            with st.spinner("Fetching stock data..."):
                stock_data = fetch_stock_data(ticker.upper(), period)

            if "error" in stock_data:
                st.error(stock_data["error"])
            else:
                render_analysis(ticker.upper(), stock_data, period, show_news=True)
        else:
            st.warning("Please enter a valid stock ticker symbol (e.g., AAPL).")
