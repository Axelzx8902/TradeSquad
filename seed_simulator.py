import os
from database import supabase

nifty50_stocks = [
    {"asset_name": "Reliance Industries", "ticker_symbol": "RELIANCE", "current_price": 2845.50, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "Tata Consultancy", "ticker_symbol": "TCS", "current_price": 3912.15, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "HDFC Bank", "ticker_symbol": "HDFCBANK", "current_price": 1442.20, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "Infosys", "ticker_symbol": "INFY", "current_price": 1675.00, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "ICICI Bank", "ticker_symbol": "ICICIBANK", "current_price": 1056.85, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "State Bank of India", "ticker_symbol": "SBIN", "current_price": 758.30, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "Bharti Airtel", "ticker_symbol": "BHARTIARTL", "current_price": 1125.40, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "ITC", "ticker_symbol": "ITC", "current_price": 408.15, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "Larsen & Toubro", "ticker_symbol": "LT", "current_price": 3520.60, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "Bajaj Finance", "ticker_symbol": "BAJFINANCE", "current_price": 6845.75, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "Hindustan Unilever", "ticker_symbol": "HINDUNILVR", "current_price": 2345.90, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "Kotak Mahindra Bank", "ticker_symbol": "KOTAKBANK", "current_price": 1789.25, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "Axis Bank", "ticker_symbol": "AXISBANK", "current_price": 1102.50, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "Tata Motors", "ticker_symbol": "TATAMOTORS", "current_price": 945.30, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "Maruti Suzuki", "ticker_symbol": "MARUTI", "current_price": 12450.00, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "Sun Pharma", "ticker_symbol": "SUNPHARMA", "current_price": 1560.80, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "Titan Company", "ticker_symbol": "TITAN", "current_price": 3680.45, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "Mahindra & Mahindra", "ticker_symbol": "M&M", "current_price": 1945.60, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "Asian Paints", "ticker_symbol": "ASIANPAINT", "current_price": 2980.15, "asset_class_id": "LARGE-CAP"},
    {"asset_name": "HCL Technologies", "ticker_symbol": "HCLTECH", "current_price": 1645.70, "asset_class_id": "LARGE-CAP"},
    
    # Adding a few Mid-Caps so the filter tabs aren't empty
    {"asset_name": "Trent Limited", "ticker_symbol": "TRENT", "current_price": 4820.00, "asset_class_id": "MID-CAP"},
    {"asset_name": "Persistent Systems", "ticker_symbol": "PERSISTENT", "current_price": 5210.30, "asset_class_id": "MID-CAP"},
    {"asset_name": "Suzlon Energy", "ticker_symbol": "SUZLON", "current_price": 45.60, "asset_class_id": "MID-CAP"}
]

print("Seeding Supabase database with NIFTY 50 and Mid-Caps...")
for stock in nifty50_stocks:
    try:
        supabase.table("market_assets").insert(stock).execute()
        print(f"Added {stock['ticker_symbol']}")
    except Exception as e:
        print(f"Skipped {stock['ticker_symbol']} - Error: {e}")
print("Seeding complete!")
