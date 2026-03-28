import re

with open('routes.py', 'r') as f:
    routes = f.read()

# Make sure we don't duplicate
if 'def get_single_asset' not in routes:
    new_route = """
@router.get("/v1/market/asset/{ticker}")
def get_single_asset(ticker: str):
    import random
    try:
        # Fetch the base asset
        res = supabase.table("assets").select("*").eq("symbol", ticker).execute()
        if not res.data:
            # Fallback trying without .NS or with .NS
            if ticker.endswith(".NS"):
                res = supabase.table("assets").select("*").eq("symbol", ticker.replace(".NS", "")).execute()
            else:
                res = supabase.table("assets").select("*").eq("symbol", ticker + ".NS").execute()
            
            if not res.data:
                raise HTTPException(status_code=404, detail="Asset not found")
                
        db_asset = res.data[0]
        base_price = float(db_asset.get("base_price", 0))
        
        # We simulate info to guarantee fast loads since YF info sometimes rate limits
        return {
            "name": db_asset.get("name", db_asset["symbol"]),
            "ticker": db_asset["symbol"],
            "price": base_price,
            "change": round(random.uniform(-1.5, 2.5), 2),
            "marketCap": f"₹{random.randint(5,20)}.0L Cr",
            "peRatio": f"{random.randint(15, 40)}.4x",
            "volume": f"{random.randint(2, 20)}.4M",
            "status": "MARKET OPEN",
            "squadHolding": random.randint(10, 80)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
"""
    routes += new_route
    with open('routes.py', 'w') as f:
        f.write(routes)
