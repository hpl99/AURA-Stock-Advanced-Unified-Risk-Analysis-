# AURA - Advanced Unified Risk Analysis

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/frontend-React%2019%20%7C%20Vite-blueviolet.svg)
![FastAPI](https://img.shields.io/badge/backend-FastAPI%20%7C%20Python-009688.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

## Executive Summary

AURA (Advanced Unified Risk Analysis) is an enterprise-grade financial visualization platform engineered to process and display real-time market data with sub-second latency. Utilizing a robust decoupled architecture—combining a Python/FastAPI backend with a high-performance React frontend—the system simulates and ingests continuous algorithmic micro-ticks. AURA delivers unparalleled precision in asset tracking, sophisticated quantitative charting, and instantaneous risk modeling tailored for modern technical analysis.

## Core Capabilities

- **Real-Time Data Ingestion:** Fully asynchronous WebSocket streaming architecture guarantees sub-second synchronization between the computation backend and client interfaces.
- **Complex Data Visualization:** Hardware-accelerated, dynamic charting engines support concurrent multi-asset rendering with uncompromised fluidity during sliding-window state updates.
- **Quantitative Derivations:** Automated, real-time computation of rolling 30-day volatility indices, Simple Moving Averages (SMA-50), and 24-hour high/low support/resistance boundaries.
- **Algorithmic Risk Assessment:** Pre-configured heuristic models dynamically categorize asset stability, surfacing automated algorithmic recommendations (e.g., High Volatility vs. Stable Trend) instantaneously.
- **Persistent Strategy Matrix:** An integrated, state-persisted annotation engine enabling technical analysts to formulate and retain quantitative trading hypotheses per asset.
- **Premium UX/UI Architecture:** A state-of-the-art interface utilizing glassmorphism composite rendering, motion-accelerated micro-animations, and sophisticated dark-mode topography.

## System Architecture

AURA operates on a strictly decoupled client-server paradigm designed for horizontal scalability and low latency:

- **Backend Engine (FastAPI/Python):**
  Maintains shared memory structures and generates multi-threaded stochastic data streams simulating realistic market micro-volatility. Broadcasts standardized JSON payloads via secure WebSocket endpoints.
- **Frontend Platform (React/Vite):**
  Establishes persistent duplex connections. Utilizes advanced memoization and precise state management to map inbound data streams into DOM updates without main-thread blocking, ensuring 60 FPS animation fidelity.

## Technical Specifications

### Frontend Infrastructure

- **Application Core:** React 19.x, Vite (HMR Enabled)
- **Design System:** Tailwind CSS v4, Lucide React (Vector Iconography)
- **Animation Engine:** Framer Motion
- **Analytics Component:** Recharts (Composed, Area, and Line paradigms)
- **Routing:** React Router v7

### Backend Infrastructure

- **Application Core:** Python 3.8+, FastAPI
- **Concurrency Model:** `asyncio`, Starlette (WebSockets)
- **ASGI Server:** Uvicorn
- **Data Simulation:** Stochastic micro-tick generation over shared memory dicts

---

## Deployment & Local Installation

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn** package manager

### 1. Initialization of Backend Services

The backend relies on the high-performance ASGI server Uvicorn to handle concurrent WebSocket connections.

```bash
# Navigate to the backend service core
cd backend

# (Optional but recommended) Initialize an isolated Python environment
python -m venv venv
source venv/bin/activate  # On Windows environments: venv\Scripts\activate

# Install required backend dependencies
pip install fastapi uvicorn websockets

# Execute the application server
python main.py
```

_The service binds locally to `http://127.0.0.1:8000`, exposing both REST and `ws://` endpoints._

### 2. Initialization of Frontend Client

The frontend leverages Vite for optimized build pipelines and instantaneous Hot Module Replacement.

```bash
# Return to the project root repository
# Note: package.json resides in the main repository root

# Install Node modules and dependencies
npm install

# Launch the frontend development server
npm run dev
```

_The client is served locally and is accessible via a standard modern web browser at `http://localhost:5173`._

---

## Operational Guidelines

1. **Market Pulse Dashboard:** Upon entry, the system automatically establishes connections to the generic `ws/market` endpoint, commencing the real-time data pipeline.
2. **Asset Subscriptions:** Analysts may selectively subscribe or unsubscribe from specific asset feeds (e.g., AAPL, TSLA, AMZN) to manage visual cognitive load via the control bar.
3. **Deep-Dive Mechanics:** Selecting an application asset routes to a dedicated analytical terminal. Analysts can toggle overlapping complex metrics including volatility gradients and SMAs. The feed scales and updates transparently.
4. **Strategy Preservation:** Qualitative analyst assessments documented in the 'My Strategy Notes' terminal are secured directly within the browser's persistent `localStorage`.

## Licensing & Proprietary Notice

This software is distributed under the MIT License unless stated otherwise by the publishing organization. All quantitative algorithms simulated within this repository are for visualization and educational demonstrations only.
