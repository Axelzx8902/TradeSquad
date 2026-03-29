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
import os
import google.generativeai as genai

# Configure Google Generative AI
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class CoachAnalyzeRequest(BaseModel):
    ticker: str
    trade_action: str
    percentage_of_portfolio: float
    current_cash: float

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

    is_mock = False
    try:
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        resp = requests.get(
            "https://finnhub.io/api/v1/news",
            params={"category": "general", "token": FINNHUB_KEY},
            timeout=10,
            verify=False
        )
        # Log response details before raising, so we know exactly what went wrong
        if not resp.ok:
            logging.error(
                f"Finnhub API returned HTTP {resp.status_code}. "
                f"Body: {resp.text[:500]}"
            )
            resp.raise_for_status()
        raw = resp.json()
        if not isinstance(raw, list) or len(raw) == 0:
            logging.warning(f"Finnhub returned unexpected payload: {str(raw)[:200]}")
            raise ValueError("Finnhub response was empty or not a list")
        articles = raw[:15]  # Cap at 15 articles
        logging.info(f"Finnhub news fetched successfully: {len(articles)} articles")
    except Exception as e:
        logging.error(f"Finnhub news error (falling back to mock): {e}")
        is_mock = True
        # FALLBACK: If API key is blocked or invalid, return realistic mock data for the MVP
        articles = [
            {
                "headline": "Reliance Industries Announces Major Green Energy Investment",
                "summary": "The conglomerate outlines a $10 Billion investment plan over the next 3 years for renewable energy projects, pushing the stock up 2.4%.",
                "source": "Financial Express",
                "datetime": int(datetime.now().timestamp()) - 3600,
                "category": "business"
            },
            {
                "headline": "RBI Keeps Repo Rate Unchanged at 6.5%",
                "summary": "The Monetary Policy Committee unanimously voted to maintain the status quo, citing inflation slightly above the 4% target.",
                "source": "Mint",
                "datetime": int(datetime.now().timestamp()) - 7200,
                "category": "economy"
            },
            {
                "headline": "TCS Secures $1.5 Billion Contract from European Bank",
                "summary": "India's largest IT services firm announces a massive decade-long digital transformation deal, signaling strong pipeline growth despite macro headwinds.",
                "source": "Economic Times",
                "datetime": int(datetime.now().timestamp()) - 10800,
                "category": "technology"
            },
            {
                "headline": "Infosys Adjusts Revenue Guidance Downward",
                "summary": "Shares slip as the software giant cuts its full-year growth outlook due to reduced client spending in the North American financial sector.",
                "source": "Reuters",
                "datetime": int(datetime.now().timestamp()) - 14400,
                "category": "business"
            },
            {
                "headline": "HDFC Bank Reports 18% Surge in Q3 Net Profit",
                "summary": "Strong retail loan growth and improved margins help the private lender beat street estimates significantly.",
                "source": "BloombergQuint",
                "datetime": int(datetime.now().timestamp()) - 18000,
                "category": "finance"
            },
            {
                "headline": "Tata Motors EV Sales Hit Record High",
                "summary": "The automaker dominates the domestic electric vehicle market with the Nexon EV leading the charge in monthly dispatches.",
                "source": "Autocar Professional",
                "datetime": int(datetime.now().timestamp()) - 21600,
                "category": "auto"
            },
            {
                "headline": "Global Markets Rally on Rate Cut Hopes",
                "summary": "Asian indices follow Wall Street higher after dovish commentary from Federal Reserve officials hints at rate cuts later this year.",
                "source": "CNBC",
                "datetime": int(datetime.now().timestamp()) - 25200,
                "category": "global"
            },
            {
                 "headline": "Foreign Investors Inject $2B into Indian Equities",
                 "summary": "FPIs return strongly to Dalal Street in the first week of the month, focusing heavily on capital goods and banking stocks.",
                 "source": "Moneycontrol",
                 "datetime": int(datetime.now().timestamp()) - 28800,
                 "category": "markets"
            }
        ]

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

    return {"trending": trending, "industry_focus": industry_focus, "is_mock": is_mock}

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
    Get profile stats computed from real DB data:
    - username, email (from Supabase auth), virtual_balance, member_since (from users table)
    - lifetime P&L: total SELL revenue minus total BUY cost (from transactions)
    - win_rate: % of sells where sell_price > buy (purchase_price from playing_xi as proxy)
    - total_trades, buy_count, sell_count (from transactions)
    - monthly_pnl_pct: P&L from transactions in the last 30 days as % of starting balance
    """
    try:
        user_id = str(user.id)

        # ── 1. Fetch user record (balance, username, created_at) ────────────
        user_record = supabase.table("users").select("*").eq("id", user_id).execute()
        if not user_record.data:
            raise HTTPException(status_code=404, detail="User profile not found in database")
        db_user = user_record.data[0]

        # ── 2. Pull email from Supabase auth user object ────────────────────
        real_email = getattr(user, "email", None) or f"{db_user.get('username', 'player').lower()}@tradesquad.io"

        # ── 3. Format member_since from created_at ──────────────────────────
        created_raw = db_user.get("created_at", "")
        member_since = "2023"  # safe fallback
        if created_raw:
            try:
                import datetime as _dt
                d = _dt.datetime.fromisoformat(created_raw.replace("Z", "+00:00"))
                member_since = d.strftime("%b %Y")  # e.g. "Mar 2026"
            except Exception:
                pass

        # ── 4. Fetch ALL transactions for P&L and win-rate computation ──────
        tx_res = (
            supabase.table("transactions")
            .select("transaction_type, price_at_transaction, quantity, executed_at")
            .eq("user_id", user_id)
            .execute()
        )
        all_txns = tx_res.data or []

        total_trades = len(all_txns)
        buy_count  = sum(1 for t in all_txns if t["transaction_type"] == "BUY")
        sell_count = total_trades - buy_count

        # Lifetime P&L = total SELL revenue − total BUY cost
        total_sell_revenue = sum(
            float(t["price_at_transaction"]) * int(t["quantity"])
            for t in all_txns if t["transaction_type"] == "SELL"
        )
        total_buy_cost = sum(
            float(t["price_at_transaction"]) * int(t["quantity"])
            for t in all_txns if t["transaction_type"] == "BUY"
        )
        lifetime_pnl = round(total_sell_revenue - total_buy_cost, 2)

        # ── 5. Win rate ─────────────────────────────────────────────────────
        # We compare each SELL price vs the asset's latest purchase_price from playing_xi.
        # This is an approximation; a fully accurate calc would need cost-basis tracking.
        # Win rate = (sells where sell_price > purchase_price) / total sells * 100
        win_rate = 0.0
        if sell_count > 0:
            sells = [t for t in all_txns if t["transaction_type"] == "SELL"]
            # As a simple proxy: count sells with price > average buy price overall
            avg_buy = (total_buy_cost / buy_count) if buy_count > 0 else 0
            profitable_sells = sum(
                1 for t in sells
                if float(t["price_at_transaction"]) > avg_buy
            )
            win_rate = round((profitable_sells / sell_count) * 100, 1)

        # ── 6. Monthly P&L (last 30 days) ───────────────────────────────────
        import datetime as _dt2
        thirty_days_ago = _dt2.datetime.now(_dt2.timezone.utc) - _dt2.timedelta(days=30)
        monthly_txns = []
        for t in all_txns:
            try:
                ts = _dt2.datetime.fromisoformat(t["executed_at"].replace("Z", "+00:00"))
                if ts >= thirty_days_ago:
                    monthly_txns.append(t)
            except Exception:
                pass

        monthly_sell = sum(
            float(t["price_at_transaction"]) * int(t["quantity"])
            for t in monthly_txns if t["transaction_type"] == "SELL"
        )
        monthly_buy = sum(
            float(t["price_at_transaction"]) * int(t["quantity"])
            for t in monthly_txns if t["transaction_type"] == "BUY"
        )
        monthly_pnl = round(monthly_sell - monthly_buy, 2)

        # Express monthly P&L as % of current balance (avoid div/0)
        current_balance = float(db_user.get("virtual_balance", 100000))
        monthly_pnl_pct = round((monthly_pnl / current_balance) * 100, 1) if current_balance else 0.0

        return {
            "user_id": str(db_user.get("id"))[:13].upper(),
            "username": db_user.get("username", "Unknown Player"),
            "email": real_email,
            "virtual_balance": current_balance,
            "member_since": member_since,
            # Computed stats
            "lifetime_pnl": lifetime_pnl,
            "win_rate": win_rate,
            "total_trades": total_trades,
            "buy_count": buy_count,
            "sell_count": sell_count,
            "monthly_pnl": monthly_pnl,
            "monthly_pnl_pct": monthly_pnl_pct,
        }
    except HTTPException:
        raise
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

@router.get("/v1/ledger")
def get_ledger(
    page: int = 1,
    page_size: int = 10,
    user = Depends(get_current_user)
):
    """
    Fetch the authenticated user's real transaction ledger from the DB.
    Joins transactions with assets to get symbol/name. Returns paginated results
    and aggregate stats (total trades, buy count, sell count, current balance).
    """
    try:
        user_id = str(user.id)

        # ── 1. Fetch ALL transactions for this user (newest first) ──────────
        tx_res = (
            supabase.table("transactions")
            .select("*")
            .eq("user_id", user_id)
            .order("executed_at", desc=True)
            .execute()
        )
        all_txns = tx_res.data or []

        # ── 2. Collect unique asset_ids and fetch asset metadata in one call ─
        asset_ids = list({t["asset_id"] for t in all_txns if t.get("asset_id")})
        assets_map = {}
        if asset_ids:
            asset_res = (
                supabase.table("assets")
                .select("id, symbol, name")
                .in_("id", asset_ids)
                .execute()
            )
            assets_map = {a["id"]: a for a in (asset_res.data or [])}

        # ── 3. Build flat transaction list ───────────────────────────────────
        def fmt_date(iso_str):
            """Format ISO timestamp -> '24 MAR 2026' style."""
            try:
                from datetime import datetime as dt
                d = dt.fromisoformat(iso_str.replace("Z", "+00:00"))
                return d.strftime("%d %b %Y").upper()
            except Exception:
                return iso_str or ""

        enriched = []
        for t in all_txns:
            asset = assets_map.get(t.get("asset_id"), {})
            enriched.append({
                "id": t.get("id"),
                "action": t.get("transaction_type", "BUY"),
                "asset": asset.get("symbol", "UNKNOWN"),
                "asset_name": asset.get("name", "Unknown Asset"),
                "price": float(t.get("price_at_transaction", 0)),
                "quantity": int(t.get("quantity", 1)),
                "date": fmt_date(t.get("executed_at", "")),
                "executed_at": t.get("executed_at", ""),
            })

        # ── 4. Aggregate stats ───────────────────────────────────────────────
        total_trades = len(enriched)
        buy_count = sum(1 for t in enriched if t["action"] == "BUY")
        sell_count = total_trades - buy_count

        # ── 5. Fetch real current balance from users table ───────────────────
        user_res = supabase.table("users").select("virtual_balance").eq("id", user_id).execute()
        current_balance = float(user_res.data[0]["virtual_balance"]) if user_res.data else 0.0

        # ── 6. Paginate ──────────────────────────────────────────────────────
        start = (page - 1) * page_size
        end = start + page_size
        page_data = enriched[start:end]
        total_pages = max(1, -(-total_trades // page_size))  # ceiling division

        return {
            "transactions": page_data,
            "stats": {
                "total_trades": total_trades,
                "buy_count": buy_count,
                "sell_count": sell_count,
                "current_balance": current_balance,
            },
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_trades": total_trades,
                "total_pages": total_pages,
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching ledger: {e}")
        raise HTTPException(status_code=500, detail="Failed to load transaction ledger")

@router.post("/coach/analyze")
def coach_analyze(payload: CoachAnalyzeRequest):
    """
    AI Coach endpoint. The Sergeant analyzes the latest trade.
    """
    if not api_key:
        return {"coach_message": "Listen here rookie, you haven't wired up my comms (GEMINI_API_KEY missing)!"}
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        
        system_instructions = (
            "You are 'The Sergeant', a gritty, gamified, slightly aggressive trading mentor in a brutalist retro trading app. "
            "Analyze the latest trade action the user just made. "
            "You must respond in a maximum of two short sentences. "
            "Be punchy, highly contextual to the exact math provided, and heavily gamified."
        )
        
        prompt = (
            f"{system_instructions}\n\n"
            f"User Trade Details:\n"
            f"- Action: {payload.trade_action.upper()}\n"
            f"- Ticker: {payload.ticker}\n"
            f"- Percentage of Portfolio used/gained: {payload.percentage_of_portfolio}%\n"
            f"- Current Cash Available: ₹{payload.current_cash}\n\n"
            f"Sergeant, give me your assessment:"
        )

        response = model.generate_content(prompt)
        coach_message = response.text.strip()
        
        if not coach_message:
            coach_message = "A quiet trade is better than a stupid one. Move along."
            
        return {"coach_message": coach_message}
    except Exception as e:
        logging.error(f"Coach analyze error: {e}")
        # Return 200 with a fallback message so the frontend UI doesn't break
        return {"coach_message": "The Sergeant's comms are jammed right now. Keep your head down and keep trading."}

