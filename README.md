# AURA Stock (Advanced Unified Risk Analysis)

![AURA Stock Banner](https://via.placeholder.com/1200x400/0f172a/00e5ff?text=AURA+Stock+-+Advanced+Unified+Risk+Analysis)

## 📌 Overview

AURA (Advanced Unified Risk Analysis) Stock is a high-performance, real-time financial market visualization dashboard. Engineered with **React (Vite)** on the frontend and **FastAPI** on the backend, it utilizes **WebSockets** to deliver sub-second micro-tick market data updates. This provides users with dynamic chart structures, real-time tabular insights, and quantitative metrics for top-tier assets.

## 🚀 Key Features

- **Live-Streaming Market Pulse:** WebSocket-powered low-latency data engine simulating real-world algorithmic micro-ticks.
- **Advanced Dynamic Charting:** Triple-asset concurrent visualization with seamless sliding-window rendering using Recharts.
- **Deep Analytics & Indicators:** Real-time statistical derivations including Simple Moving Average (SMA 50), Volatility indices (30-day), and rolling 24h High/Low boundaries.
- **Algorithmic Recommendations:** Automated, rule-based quantitative risk and trend analysis indicators.
- **Premium Interactive UI:** State-of-the-art glassmorphism design, neon accents, and optimized micro-animations powered by Framer Motion and Tailwind CSS v4.
- **Strategy Notes Engine:** LocalStorage-persisted mechanism allowing traders to capture and retain asset-specific quantitative hypotheses.

## 🛠️ Technology Stack

### Frontend

- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Charting:** Recharts
- **Icons:** Lucide React
- **Routing:** React Router DOM v7

### Backend

- **Framework:** FastAPI (Python)
- **Concurrency:** Asyncio & WebSockets
- **Server:** Uvicorn

## 🔧 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (3.8+)

### Setup Instructions

#### 1. Backend Server Setup

Navigate to the central backend directory and initiate the WebSocket streaming server:

```bash
cd backend
# Install required Python packages (it is recommended to use a virtual environment)
pip install fastapi uvicorn websockets
# Start the server
python main.py
```

_The FastAPI server will boot up and bind to `http://127.0.0.1:8000`._

#### 2. Frontend Client Setup

Open a new terminal window, navigate to the project root, and run the Vite environment:

```bash
# Install NPM dependencies
npm install

# Start the Vite development environment
npm run dev
```

_The web application will instantly be served, typically at `http://localhost:5173`._

## 💡 Application Usage

- Launch the application to land on the **Market Pulse** overview.
- Dynamically toggle visibility of AAPL, TSLA, and AMZN pricing feeds on the multi-chart panel via the upper control buttons.
- Examine the **High-Speed Metrics** table to observe live price flashing, calculated risk models, and trend indications.
- Navigate into individual asset dashboards (e.g., Apple, Tesla) to observe granular metrics like SMA and Volatility overlays, and securely type and commit personal **Strategy Notes**.

---

_Built for optimal asset tracking and advanced market insight visualization._
