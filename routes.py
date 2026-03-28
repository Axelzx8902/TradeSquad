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
    """Fetch real-time NSE stock data via yfinance. Only useful when market is open."""
    import yfinance as yf

    # Pull symbols from Supabase assets table
    try:
        resp = supabase.table("assets").select("symbol, name, asset_class").execute()
        db_assets = resp.data or []
    except Exception as e:
        logging.error(f"Supabase fetch error in live: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch asset list")

    if not db_assets:
        raise HTTPException(status_code=404, detail="No assets found in database")

    # yfinance uses .NS suffix for NSE-listed stocks
    symbols_map = {a["symbol"]: a for a in db_assets}
    tickers = [s + ".NS" for s in symbols_map.keys()]

    try:
        data = yf.download(tickers, period="2d", interval="1d", progress=False, auto_adjust=True)
        closes = data["Close"] if "Close" in data else {}
    except Exception as e:
        logging.error(f"yfinance error: {e}")
        raise HTTPException(status_code=502, detail="yfinance data unavailable")

    results = []
    for sym, meta in symbols_map.items():
        ticker_key = sym + ".NS"
        try:
            prices = closes[ticker_key].dropna()
            if len(prices) < 2:
                continue
            prev_close = float(prices.iloc[-2])
            last_price = float(prices.iloc[-1])
            change_pct = round(((last_price - prev_close) / prev_close) * 100, 2)
            results.append({
                "id": None,
                "symbol": sym,
                "ticker_symbol": sym,
                "name": meta.get("name", sym),
                "asset_name": meta.get("name", sym),
                "asset_class": meta.get("asset_class", "LARGE-CAP"),
                "asset_class_id": meta.get("asset_class", "LARGE-CAP"),
                "current_price": round(last_price, 2),
                "change_percent": change_pct,
                "is_positive": change_pct > 0,
                "required_lesson_id": None
            })
        except Exception:
            continue  # Skip assets with no yfinance data gracefully

    return {"assets": results, "source": "yfinance", "is_live": True}

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
    """Scrape Google News RSS for Indian finance and return trending & industry_focus."""
    import feedparser, random
    RSS_URL = "https://news.google.com/rss/search?q=finance+india+stock+market&hl=en-IN&gl=IN&ceid=IN:en"
    feed = feedparser.parse(RSS_URL)
    entries = feed.entries[:10]

    # Clean titles by removing publisher after ' - '
    cleaned = []
    for entry in entries:
        title = entry.title
        if " - " in title:
            title = title.split(" - ")[0]
        cleaned.append(title)

    # Trending first 3
    trending = [{"id": i+1, "headline": cleaned[i]} for i in range(min(3, len(cleaned)))]

    # Industry focus remaining 7 with random sector badge
    sectors = ["#BANKING", "#IT", "#ENERGY"]
    industry_focus = []
    for i in range(3, len(cleaned)):
        industry_focus.append({
            "id": i+1,
            "headline": cleaned[i],
            "sector_badge": random.choice(sectors)
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
    This includes relations joining the market_assets table to get asset details.
    """
    try:
        response = supabase.table("playing_xi").select("*, market_assets(*)").eq("user_id", user.id).execute()
        return {"portfolio": response.data}
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

        # 1. Fetch the asset to check its price
        asset_res = supabase.table("market_assets").select("*").eq("id", request.asset_id).execute()
        if not asset_res.data:
            raise HTTPException(status_code=404, detail="Asset not found")
        asset = asset_res.data[0]
        
        # 2. Fetch the user to check their current balance
        user_res = supabase.table("users").select("*").eq("id", user_id).execute()
        if not user_res.data:
            raise HTTPException(status_code=404, detail="User not found")
        db_user = user_res.data[0]
        
        # 3. Calculate total cost and check for insufficient funds
        current_price = float(asset['current_price'])
        total_cost = current_price * request.quantity
        current_balance = float(db_user['virtual_balance'])
        
        if current_balance < total_cost:
            raise HTTPException(status_code=400, detail="Insufficient virtual balance to complete this purchase")
            
        # 4. Deduct the amount from the user's balance
        new_balance = current_balance - total_cost
        supabase.table("users").update({"virtual_balance": new_balance}).eq("id", user_id).execute()
        
        # 5. Insert the new asset into the user's playing_xi
        supabase.table("playing_xi").insert({
            "user_id": user_id,
            "asset_id": request.asset_id,
            "purchase_price": current_price,
            "quantity": request.quantity
        }).execute()
        
        # 6. Record the transaction in the ledger
        supabase.table("transactions").insert({
            "user_id": user_id,
            "asset_id": request.asset_id,
            "transaction_type": "BUY",
            "price_at_transaction": current_price,
            "quantity": request.quantity
        }).execute()
        
        return {
            "status": "success",
            "message": f"Successfully purchased {request.quantity}x {asset['asset_name']}",
            "new_balance": new_balance
        }
    except HTTPException:
        # Re-raise known errors (like 400 or 404)
        raise
    except Exception as e:
        logging.error(f"Error completing purchase: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while processing the transaction")

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
            "win_rate": 68.4
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
