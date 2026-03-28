from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
import asyncio
from pydantic import BaseModel
import logging

from database import supabase, get_current_user

router = APIRouter(prefix="/api", tags=["Trading API"])

# Pydantic models for request bodies
class BuyAssetRequest(BaseModel):
    asset_id: str
    quantity: int = 1

import random
import datetime
import pytz

# ── Market Hours Helper ──────────────────────────────────────────────────────
INDIA_TZ = pytz.timezone("Asia/Kolkata")

def is_market_open() -> bool:
    """Returns True only if NSE/BSE trading hours Mon-Fri 9:15am–3:30pm IST."""
    now = datetime.datetime.now(INDIA_TZ)
    if now.weekday() >= 5:          # 5=Sat, 6=Sun
        return False
    market_open  = now.replace(hour=9,  minute=15, second=0, microsecond=0)
    market_close = now.replace(hour=15, minute=30, second=0, microsecond=0)
    return market_open <= now <= market_close

@router.get("/v1/market/scout")
def get_market_scout():
    """Fallback REST endpoint for initial load or environments blocking WS."""
    try:
        response = supabase.table("assets").select("*").execute()
        raw_assets = response.data
        
        simulated_assets = []
        for asset in raw_assets:
            base_price = float(asset.get("base_price", 0))
            shift = random.uniform(-0.008, 0.008)
            sim_price = round(base_price * (1 + shift), 2)
            change_pct = round(shift * 100, 2)
            
            simulated_assets.append({
                "id": asset.get("id"),
                "symbol": asset.get("symbol"),                  # DB native
                "ticker_symbol": asset.get("symbol"),           # Legacy React map
                "name": asset.get("name"),                      # DB native
                "asset_name": asset.get("name"),                # Legacy React map
                "asset_class": asset.get("asset_class"),        # DB native
                "asset_class_id": asset.get("asset_class"),     # Legacy React map
                "current_price": sim_price,
                "change_percent": change_pct,
                "is_positive": change_pct > 0,
                "required_lesson_id": None
            })
            
        return {"assets": simulated_assets}
    except Exception as e:
        logging.error(f"Error fetching scout assets: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/v1/market/status")
def get_market_status():
    """Return whether NSE/BSE is currently open based on IST time."""
    now = datetime.datetime.now(INDIA_TZ)
    open_ = is_market_open()
    reason = None
    if now.weekday() >= 5:
        reason = "Weekend — markets reopen Monday 9:15 AM IST"
    elif not open_:
        reason = "Markets open Mon-Fri 9:15 AM – 3:30 PM IST"
    return {
        "is_open": open_,
        "reason": reason,
        "current_ist": now.strftime("%A, %d %b %Y %I:%M %p IST")
    }

@router.get("/v1/market/live")
def get_market_live():
    """Fetch real-time NSE stock data via yfinance.
    Returns last-known close prices even when market is closed."""
    import yfinance as yf

    market_open = is_market_open()

    # Pull symbols from Supabase assets table (includes id for buy flow)
    try:
        resp = supabase.table("assets").select("id, symbol, name, asset_class, base_price").execute()
        db_assets = resp.data or []
    except Exception as e:
        logging.error(f"Supabase fetch error in live: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch asset list")

    if not db_assets:
        raise HTTPException(status_code=404, detail="No assets found in database")

    # yfinance uses .NS suffix for NSE-listed stocks
    symbols_map = {a["symbol"]: a for a in db_assets}
    tickers = [s + ".NS" for s in symbols_map.keys()]

    results = []
    yf_success = False

    try:
        data = yf.download(tickers, period="5d", interval="1d", progress=False, auto_adjust=True)
        if "Close" in data.columns.get_level_values(0):
            closes = data["Close"]
            yf_success = True
    except Exception as e:
        logging.error(f"yfinance error: {e}")
        yf_success = False

    for sym, meta in symbols_map.items():
        ticker_key = sym + ".NS"
        asset_id = meta.get("id")
        asset_name = meta.get("name", sym)
        asset_class = meta.get("asset_class", "LARGE-CAP")
        base_price = float(meta.get("base_price", 0))

        last_price = base_price
        change_pct = 0.0

        if yf_success:
            try:
                prices = closes[ticker_key].dropna()
                if len(prices) >= 2:
                    prev_close = float(prices.iloc[-2])
                    last_price = float(prices.iloc[-1])
                    change_pct = round(((last_price - prev_close) / prev_close) * 100, 2)
                elif len(prices) == 1:
                    last_price = float(prices.iloc[-1])
                    change_pct = 0.0
            except Exception:
                pass  # Fallback to base_price already set

        results.append({
            "id": asset_id,
            "symbol": sym,
            "ticker_symbol": sym,
            "name": asset_name,
            "asset_name": asset_name,
            "asset_class": asset_class,
            "asset_class_id": asset_class,
            "current_price": round(last_price, 2),
            "change_percent": change_pct,
            "is_positive": change_pct > 0,
            "required_lesson_id": None
        })

    return {
        "assets": results,
        "source": "yfinance",
        "is_live": True,
        "is_market_open": market_open
    }

@router.get("/v1/market/candles/{ticker}")
def get_candle_data(ticker: str):
    """Fetch 5-day intraday (15 min) OHLC candle data for a given NSE ticker via yfinance."""
    import yfinance as yf

    # Auto-append .NS for Indian stocks if not already present
    symbol = ticker.strip().upper()
    if not symbol.endswith(".NS") and not symbol.endswith(".BO"):
        symbol = symbol + ".NS"

    try:
        tk = yf.Ticker(symbol)
        df = tk.history(period="5d", interval="15m")
    except Exception as e:
        logging.error(f"yfinance candle error for {symbol}: {e}")
        raise HTTPException(status_code=502, detail=f"Could not fetch data for {symbol}")

    if df is None or df.empty:
        raise HTTPException(status_code=404, detail=f"No candle data returned for {symbol}")

    candles = []
    for ts, row in df.iterrows():
        candles.append({
            "timestamp": int(ts.timestamp() * 1000),  # epoch ms for JS
            "open": round(float(row["Open"]), 2),
            "high": round(float(row["High"]), 2),
            "low": round(float(row["Low"]), 2),
            "close": round(float(row["Close"]), 2),
        })

    return {"symbol": symbol, "candles": candles}

@router.websocket("/ws/market/scout")
async def websocket_market_scout(websocket: WebSocket):
    """Live streaming endpoint pumping prices to the UI."""
    await websocket.accept()
    
    try:
        # Cache baseline once to save database read quotas; we randomize offset off this
        response = supabase.table("assets").select("*").execute()
        raw_assets = response.data
    except Exception as e:
        logging.error(f"WS Base Fetch Error: {e}")
        await websocket.close(code=1011)
        return
        
    try:
        while True:
            simulated_assets = []
            for asset in raw_assets:
                base_price = float(asset.get("base_price", 0))
                # Slightly higher volatility for visual spectacle
                shift = random.uniform(-0.015, 0.015) 
                sim_price = round(base_price * (1 + shift), 2)
                change_pct = round(shift * 100, 2)
                
                simulated_assets.append({
                    "id": asset.get("id"),
                    "symbol": asset.get("symbol"),
                    "ticker_symbol": asset.get("symbol"),
                    "name": asset.get("name"),
                    "asset_name": asset.get("name"),
                    "asset_class": asset.get("asset_class"),
                    "asset_class_id": asset.get("asset_class"),
                    "current_price": sim_price,
                    "change_percent": change_pct,
                    "is_positive": change_pct > 0,
                    "required_lesson_id": None
                })
            
            await websocket.send_json({"assets": simulated_assets})
            
            # Heartbeat stream delay to prevent UI tearing (3s)
            await asyncio.sleep(3)
            
    except WebSocketDisconnect:
        logging.info("Marketplace visually disconnected, terminating stream cleanly.")
    except Exception as e:
        logging.error(f"WS Streaming error: {e}")

@router.get("/v1/news")
def get_market_news():
    """Fetch market news from Finnhub API for Indian / general finance news."""
    import requests, os, random
    from datetime import datetime, timezone

    FINNHUB_KEY = os.getenv("FINNHUB_API_KEY", "")
    if not FINNHUB_KEY:
        raise HTTPException(status_code=500, detail="FINNHUB_API_KEY not configured in .env")

    try:
        resp = requests.get(
            "https://finnhub.io/api/v1/news",
            params={"category": "general", "token": FINNHUB_KEY},
            timeout=10
        )
        resp.raise_for_status()
        articles = resp.json()[:15]  # Cap at 15 articles
    except Exception as e:
        logging.error(f"Finnhub news error: {e}")
        raise HTTPException(status_code=502, detail="Could not fetch news from Finnhub")

    # Format timestamps
    def fmt_time(epoch):
        try:
            dt = datetime.fromtimestamp(epoch, tz=timezone.utc)
            return dt.strftime("%d %b %Y, %I:%M %p UTC")
        except Exception:
            return ""

    # Split into trending (first 5) and industry_focus (rest)
    sectors = ["#BANKING", "#IT", "#ENERGY", "#PHARMA", "#AUTO", "#MARKETS"]

    trending = []
    for i, a in enumerate(articles[:5]):
        trending.append({
            "id": i + 1,
            "headline": a.get("headline", ""),
            "summary": a.get("summary", ""),
            "source": a.get("source", ""),
            "timestamp": fmt_time(a.get("datetime", 0)),
            "url": a.get("url", ""),
            "image": a.get("image", ""),
            "category": a.get("category", "general"),
        })

    industry_focus = []
    for i, a in enumerate(articles[5:]):
        industry_focus.append({
            "id": i + 6,
            "headline": a.get("headline", ""),
            "summary": a.get("summary", ""),
            "source": a.get("source", ""),
            "timestamp": fmt_time(a.get("datetime", 0)),
            "url": a.get("url", ""),
            "image": a.get("image", ""),
            "sector_badge": random.choice(sectors),
        })

    return {"trending": trending, "industry_focus": industry_focus}

@router.get("/users/me")
def get_user_profile(user = Depends(get_current_user)):
    """
    Fetch the authenticated user's profile and virtual balance directly from the Supabase Postgres DB.
    """
    try:
        response = supabase.table("users").select("*").eq("id", user.id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found in database")
        return {"user": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching user profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/portfolio")
def get_playing_xi(user = Depends(get_current_user)):
    """
    Fetch the authenticated user's 'Playing XI' portfolio.
    Manually joins with the assets table to avoid PostgREST relationship errors.
    """
    try:
        res_xi = supabase.table("playing_xi").select("*").eq("user_id", user.id).execute()
        xi_data = res_xi.data or []
        
        if not xi_data:
            return {"portfolio": []}
            
        asset_ids = [item["asset_id"] for item in xi_data if item.get("asset_id")]
        
        if asset_ids:
            res_assets = supabase.table("assets").select("*").in_("id", asset_ids).execute()
            assets_dict = {a["id"]: a for a in (res_assets.data or [])}
        else:
            assets_dict = {}
            
        portfolio = []
        for item in xi_data:
            aid = item.get("asset_id")
            item["assets"] = assets_dict.get(aid)
            portfolio.append(item)
            
        return {"portfolio": portfolio}
    except Exception as e:
        logging.error(f"Error fetching portfolio: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching portfolio")

@router.post("/buy")
def buy_asset(request: BuyAssetRequest, user = Depends(get_current_user)):
    """
    Simulate buying a new asset using JWT identity.
    Checks user balance, calculates cost, deducts balance, and adds to Playing XI.
    """
    try:
        user_id = user.id

        # 1. Fetch the asset to check its price (lookup by symbol since frontend passes ticker)
        asset_res = supabase.table("assets").select("*").eq("symbol", request.asset_id).execute()
        if not asset_res.data:
            raise HTTPException(status_code=404, detail="Asset not found")
        asset = asset_res.data[0]
        db_asset_id = asset['id']
        
        # 2. Fetch the user to check their current balance
        user_res = supabase.table("users").select("*").eq("id", user_id).execute()
        if not user_res.data:
            raise HTTPException(status_code=404, detail="User not found")
        db_user = user_res.data[0]
        
        # 3. Calculate total cost and check for insufficient funds
        current_price = float(asset.get('base_price', 0))
        total_cost = current_price * request.quantity
        current_balance = float(db_user['virtual_balance'])
        
        if current_balance < total_cost:
            raise HTTPException(status_code=400, detail="Insufficient virtual balance to complete this purchase")
            
        # 4. Deduct the amount from the user's balance
        new_balance = current_balance - total_cost
        supabase.table("users").update({"virtual_balance": new_balance}).eq("id", user_id).execute()
        
        # 5. Check if user already owns it, then update or insert
        xi_res = supabase.table("playing_xi").select("*").eq("user_id", user_id).eq("asset_id", db_asset_id).execute()
        if xi_res.data:
            existing = xi_res.data[0]
            # simplistic average cost calculation
            new_quantity = existing['quantity'] + request.quantity
            old_total = existing['purchase_price'] * existing['quantity']
            new_avg = (old_total + total_cost) / new_quantity
            supabase.table("playing_xi").update({
                "quantity": new_quantity,
                "purchase_price": new_avg
            }).eq("id", existing['id']).execute()
        else:
            supabase.table("playing_xi").insert({
                "user_id": user_id,
                "asset_id": db_asset_id,
                "purchase_price": current_price,
                "quantity": request.quantity
            }).execute()
        
        # 6. Record the transaction in the ledger
        supabase.table("transactions").insert({
            "user_id": user_id,
            "asset_id": db_asset_id,
            "transaction_type": "BUY",
            "price_at_transaction": current_price,
            "quantity": request.quantity
        }).execute()
        
        return {
            "status": "success",
            "message": f"Successfully purchased {request.quantity}x {asset.get('name', 'Asset')}",
            "new_balance": new_balance
        }
    except HTTPException:
        # Re-raise known errors (like 400 or 404)
        raise
    except Exception as e:
        logging.error(f"Error completing purchase: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while processing the transaction")

@router.post("/sell")
def sell_asset(request: BuyAssetRequest, user = Depends(get_current_user)):
    try:
        user_id = user.id
        
        # 1. Fetch asset (lookup by symbol)
        asset_res = supabase.table("assets").select("*").eq("symbol", request.asset_id).execute()
        if not asset_res.data:
            raise HTTPException(status_code=404, detail="Asset not found")
        asset = asset_res.data[0]
        db_asset_id = asset['id']
        current_price = float(asset.get('base_price', 0))
        
        # 2. Check quantities
        xi_res = supabase.table("playing_xi").select("*").eq("user_id", user_id).eq("asset_id", db_asset_id).execute()
        if not xi_res.data:
            raise HTTPException(status_code=400, detail="You do not own this asset")
            
        playing_xi_item = xi_res.data[0]
        owned_quantity = playing_xi_item['quantity']
        
        if request.quantity > owned_quantity:
            raise HTTPException(status_code=400, detail=f"Cannot sell {request.quantity}, you only own {owned_quantity}")
            
        # 3. Add to user's balance
        user_res = supabase.table("users").select("*").eq("id", user_id).execute()
        current_balance = float(user_res.data[0]['virtual_balance'])
        total_revenue = current_price * request.quantity
        new_balance = current_balance + total_revenue
        supabase.table("users").update({"virtual_balance": new_balance}).eq("id", user_id).execute()
        
        # 4. Update/Delete playing_xi
        new_quantity = owned_quantity - request.quantity
        if new_quantity <= 0:
            supabase.table("playing_xi").delete().eq("id", playing_xi_item['id']).execute()
        else:
            supabase.table("playing_xi").update({"quantity": new_quantity}).eq("id", playing_xi_item['id']).execute()
            
        # 5. Ledger
        supabase.table("transactions").insert({
            "user_id": user_id,
            "asset_id": db_asset_id,
            "transaction_type": "SELL",
            "price_at_transaction": current_price,
            "quantity": request.quantity
        }).execute()
        return {"status": "success", "message": f"Sold {request.quantity}x {asset.get('name', 'Asset')}", "new_balance": new_balance}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error completing sale: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/v1/users/me/stats")
def get_user_stats(user = Depends(get_current_user)):
    """
    Get profile stats and metadata for the global Zustand store.
    """
    try:
        user_record = supabase.table("users").select("*").eq("id", user.id).execute()
        
        # If the mock user UUID doesn't actually exist in the DB, fallback to a local mock object gracefully
        if not user_record.data:
            return {
                "user_id": "#CRIC-TEST",
                "username": "MVP Demo User",
                "email": "demo@tradesquad.io",
                "lifetime_pnl": 452000,
                "win_rate": 68.4
            }
            
        db_user = user_record.data[0]
        return {
            "user_id": str(db_user.get("id"))[:13].upper(), # Shortened UI ID
            "username": db_user.get("username", "Unknown Player"),
            "email": f"{db_user.get('username', 'player').lower()}@tradesquad.io",
            "lifetime_pnl": 452000, # Mock computed stats since we lack PnL resolution currently
            "win_rate": 68.4,
            "virtual_balance": float(db_user.get("virtual_balance", 0))
        }
    except Exception as e:
        logging.error(f"Error fetching user stats: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch user stats")

@router.get("/lessons/status")
def get_lessons_status(user = Depends(get_current_user)):
    """
    Fetch the status of the authenticated user's 'Dugout' lessons progress.
    """
    try:
        response = supabase.table("user_lessons_progress").select("*, dugout_lessons(*)").eq("user_id", user.id).execute()
        return {"lessons_progress": response.data}
    except Exception as e:
        logging.error(f"Error fetching lesson status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching lesson progress")

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
