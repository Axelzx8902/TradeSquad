# 📈 TradeSquad: The AI-Powered Trading Gauntlet

**TradeSquad** is a high-stakes, gamified stock trading simulator that turns market volatility into a social competition. Built for the modern trader, it combines real-time financial data with a "brutally honest" AI Coach that analyzes your portfolio and roasts your trading decisions in real-time.

### 🔗 [Live Demo](https://tradesquad.netlify.app/) | [Backend API Docs](https://tradesquad.onrender.com/docs)

---

## 🚀 Key Features

- **The AI Roast Coach:** Powered by **Google Gemini**, the coach doesn't just provide "advice"—it analyzes your portfolio risk, identifies "panic selling," and roasts your strategy based on current market sentiment.
- **Real-Time Market Pulse:** Integrated with the **Finnhub API** to provide live price action, candlestick data, and global financial news.
- **Seamless Sync:** Leveraging **Supabase (PostgreSQL)** for millisecond-latency authentication and real-time database updates across devices.
- **Gamified UX:** A custom-built **Vite/React** dashboard that handles complex state management for live portfolio tracking and interactive charts.

---

## 🛠️ The Tech Stack

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 18 (Vite) |
| Styling | Tailwind CSS (Mobile-responsive UI) |
| Deployment | Netlify (Global CDN) |
| Environment | Decoupled architecture using Vite Environment Variables |

### Backend

| Layer | Technology |
|---|---|
| Framework | FastAPI (Python 3.11) |
| AI Engine | Google Gemini Pro |
| Data Provider | Finnhub Stock API |
| Deployment | Render (Singapore Region for optimized latency) |
| Security | Custom CORS middleware for secure cross-origin communication |

### Database & Auth

| Layer | Technology |
|---|---|
| Provider | Supabase |
| Database | PostgreSQL |
| Auth | JWT-based secure session management |

---

## ⚙️ Local Setup

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Configuration (Environment Variables)

| Variable | Location | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | Database Connection |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Secure API Access |
| `VITE_API_BASE_URL` | Frontend | Target Backend URL (Local or Render) |
| `GEMINI_API_KEY` | Backend | AI Roast Logic |
| `FINNHUB_API_KEY` | Backend | Live Market Data |

---

## 🏗️ Architecture Note

TradeSquad uses a **Stateless Microservice Architecture**. The frontend is a static asset served via Netlify, while the FastAPI backend acts as an independent compute engine on Render. This ensures that heavy AI processing doesn't block the UI, providing a smooth, "app-like" experience even on mobile devices.

---

## 👨‍💻 Author

**Aditya Ashish Gupta**
NIT Jalandhar | AI, Machine Learning & Data Science Enthusiast

**Advisor & Co-Author:**
Aarav Singh — NIT Jalandhar
