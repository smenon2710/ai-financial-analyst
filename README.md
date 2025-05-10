# 📊 AI Financial Analyst

A Streamlit-based agentic app that helps you:

- 🔍 Analyze individual stocks with AI-generated insights
- 🧠 Get buy/sell/hold recommendations using OpenAI models
- 📈 Visualize historical price trends from Yahoo Finance
- 🗞️ See real-time news headlines related to any stock
- 🎯 Discover potential stock picks by sector/theme

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/ai-financial-analyst.git
cd ai-financial-analyst
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
streamlit run main.py
```

## 🌙 Dark Theme

Dark mode is enabled via `.streamlit/config.toml`.

---

## 📂 Project Structure

```
ai-financial-analyst/
├── agent/
│   ├── analysis_agent.py
│   ├── financial_data.py
│   ├── news_fetcher.py
│   └── utils.py
├── .streamlit/
│   └── config.toml
├── main.py
├── requirements.txt
├── .gitignore
└── README.md
```

---

## 🔐 API Keys

Create a `.env` file and add your OpenAI key:

```
OPENAI_API_KEY=your-key
```

---

## 📜 License

MIT