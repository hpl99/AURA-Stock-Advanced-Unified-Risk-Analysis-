from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import random
from datetime import datetime, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared Memory Data Store
MARKET_DATA = {
    "AAPL": {"price": 170.50, "high": 175.0, "low": 169.0, "volatility30": 0.35},
    "TSLA": {"price": 185.20, "high": 190.0, "low": 182.0, "volatility30": 0.85},
    "AMZN": {"price": 145.80, "high": 148.0, "low": 144.0, "volatility30": 0.45}
}

class ConnectionManager:
    def __init__(self):
        self.active_connections: list = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                dead_connections.append(connection)
                
        for conn in dead_connections:
            if conn in self.active_connections:
                self.active_connections.remove(conn)

manager = ConnectionManager()

# Generate historical seeds so the chart isn't empty initially.
def generate_historical(ticker):
    rows = []
    base_price = MARKET_DATA[ticker]["price"]
    vol = MARKET_DATA[ticker]["volatility30"]
    base_date = datetime.now() - timedelta(days=30)
    
    current_trend = base_price * 0.9
    for i in range(30):
        current_trend = current_trend * (1 + random.uniform(-0.02, 0.022))
        rows.append({
            "date": (base_date + timedelta(days=i)).strftime("%Y-%m-%d"),
            "close": round(current_trend, 2),
            "sma50": round(base_price * 1.05, 2) if i > 5 else None,
            "volatility30": round(vol * random.uniform(0.9, 1.1), 4)
        })
    return rows

@app.get("/metrics/all")
def get_all_metrics():
    # Keep the same expected JSON structure for historical loads
    data = {}
    for ticker in MARKET_DATA.keys():
        data[ticker] = {"rows": generate_historical(ticker)}
    return {"data": data}

@app.get("/metrics/{ticker}")
def get_ticker_metrics(ticker: str):
    ticker = ticker.upper()
    if ticker in MARKET_DATA:
        return {"ticker": ticker, "rows": generate_historical(ticker)}
    return {"error": "Ticker not found"}

@app.websocket("/ws/market")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Maintain connection alive. Wait for potential client ping.
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

# Background Task for generating live prices
async def price_generator():
    while True:
        # Generate micro-ticks every 0.8 to 2 seconds
        await asyncio.sleep(random.uniform(0.8, 2.0))
        
        # Pick 1 to 3 tickers to update simultaneously
        tickers_to_update = random.sample(list(MARKET_DATA.keys()), random.randint(1, 3))
        
        for ticker in tickers_to_update:
            old_price = MARKET_DATA[ticker]["price"]
            
            # Simulated Random Walk
            change_pct = random.uniform(-0.008, 0.008) # +/- 0.8% jumps
            new_price = round(old_price * (1 + change_pct), 2)
            
            if new_price > MARKET_DATA[ticker]["high"]:
                MARKET_DATA[ticker]["high"] = new_price
            if new_price < MARKET_DATA[ticker]["low"]:
                MARKET_DATA[ticker]["low"] = new_price
                
            MARKET_DATA[ticker]["price"] = new_price
            vol = MARKET_DATA[ticker]["volatility30"] * random.uniform(0.98, 1.02)
            MARKET_DATA[ticker]["volatility30"] = vol
            
            payload = {
                "ticker": ticker,
                "price": new_price,
                "change": round(change_pct, 4),
                "volatility30": round(vol, 4),
                "24hHigh": MARKET_DATA[ticker]["high"],
                "24hLow": MARKET_DATA[ticker]["low"],
                "timestamp": datetime.now().strftime("%H:%M:%S")
            }
            
            await manager.broadcast(payload)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(price_generator())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
