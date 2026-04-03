from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random

app = FastAPI()

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_mock_data(start_price=150.0):
    rows = []
    current_price = start_price
    base_date = datetime.now() - timedelta(days=30)
    
    for i in range(30):
        date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        
        # Random walk for price
        change = random.uniform(-0.03, 0.03)  # +/- 3%
        current_price = current_price * (1 + change)
        
        # Calculate moving average (mock logic)
        sma50 = current_price * random.uniform(0.95, 1.05) if i > 10 else None
        
        # Calculate volatility (mock logic)
        volatility30 = random.uniform(0.01, 0.08)
        
        row = {
            "date": date_str,
            "close": round(current_price, 2),
            "sma50": round(sma50, 2) if sma50 else None,
            "volatility30": round(volatility30, 4)
        }
        rows.append(row)
        
    return rows

# Generate static mock data so it doesn't change on every request
MOCK_DATA = {
    "AAPL": {"rows": generate_mock_data(start_price=170.50)},
    "TSLA": {"rows": generate_mock_data(start_price=185.20)},
    "AMZN": {"rows": generate_mock_data(start_price=145.80)}
}

@app.get("/metrics/all")
def get_all_metrics():
    return {"data": MOCK_DATA}

@app.get("/metrics/{ticker}")
def get_ticker_metrics(ticker: str):
    ticker = ticker.upper()
    if ticker in MOCK_DATA:
        return {"ticker": ticker, "rows": MOCK_DATA[ticker]["rows"]}
    return {"error": "Ticker not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
