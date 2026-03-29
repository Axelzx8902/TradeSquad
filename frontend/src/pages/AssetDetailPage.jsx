import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';
import CoachAlert from '../components/CoachAlert';
import DemoStockChart from '../components/DemoStockChart';
import api, { buyAsset, sellAsset, fetchAssetByTicker } from '../api';
import useUserStore from '../store/userStore';
import usePortfolioStore from '../store/portfolioStore';

const TIME_PERIODS = ['5D'];

export default function AssetDetailPage() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const { updateBalance } = useUserStore();
  const { portfolio, fetchData: fetchPortfolio } = usePortfolioStore();
  
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('5D');
  const [quantity, setQuantity] = useState(1);
  const [coachAlert, setCoachAlert] = useState(null);
  const [squadRole, setSquadRole] = useState('');
  
  // New state for AI Coach
  const [coachMessage, setCoachMessage] = useState(null);
  const [isTrading, setIsTrading] = useState(false);

  // States for Chart
  const [candleData, setCandleData] = useState([]);
  const [candleLoading, setCandleLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(() => {
    return localStorage.getItem('tradesquad_data_mode') === 'live';
  });

  // Listen for Live toggle changes
  useEffect(() => {
    const handleModeChange = (e) => setIsLiveMode(e.detail?.live ?? false);
    window.addEventListener('tradesquad_mode_change', handleModeChange);
    return () => window.removeEventListener('tradesquad_mode_change', handleModeChange);
  }, []);

  useEffect(() => {
    const getAsset = async () => {
      setLoading(true);
      try {
        const data = await fetchAssetByTicker(ticker);
        setAsset(data);
      } catch (err) {
        setCoachAlert({
          title: 'Umpire Disagrees',
          message: 'Could not fetch asset details. It may be delisted or invalid.'
        });
      } finally {
        setLoading(false);
      }
    };

    const getCandleData = async () => {
      setCandleLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      fetch(`${baseUrl}/v1/market/candles/${ticker}`)
        .then(r => r.json())
        .then(data => {
          setCandleData(data.candles || []);
          setCandleLoading(false);
        })
        .catch(() => setCandleLoading(false));
    };

    if (ticker) {
      getAsset();
      getCandleData();
    }
  }, [ticker]);

  useEffect(() => {
    if (portfolio.length === 0) {
      fetchPortfolio();
    }
  }, [portfolio.length, fetchPortfolio]);

  const ownedQty = portfolio.find(p => p.ticker === ticker)?.quantity || 0;

  const handleBuy = async () => {
    setIsTrading(true);
    try {
      const res = await buyAsset(ticker, quantity);
      if (res.new_balance) updateBalance(res.new_balance);
      
      const tradeValue = asset.price * quantity;
      const total = res.new_balance + tradeValue;
      const pct = total > 0 ? (tradeValue / total) * 100 : 0;

      const coachRes = await api.post('/coach/analyze', {
        ticker: ticker,
        trade_action: 'buy',
        percentage_of_portfolio: parseFloat(pct.toFixed(2)),
        current_cash: res.new_balance
      });
      setCoachMessage(coachRes.data.coach_message);
    } catch (err) {
      setCoachAlert({
        title: 'Trade Failed', 
        message: err.response?.data?.detail || 'Insufficient balance or server error.'
      });
    } finally {
      setIsTrading(false);
    }
  };

  const handleSell = async () => {
    setIsTrading(true);
    try {
      const res = await sellAsset(ticker, quantity);
      if (res.new_balance) updateBalance(res.new_balance);

      const tradeValue = asset.price * quantity;
      // For a sell, they just gained cash, so total before sell was approx new_balance - tradeValue
      const total = Math.max(res.new_balance, tradeValue);
      const pct = total > 0 ? (tradeValue / total) * 100 : 0;

      const coachRes = await api.post('/coach/analyze', {
        ticker: ticker,
        trade_action: 'sell',
        percentage_of_portfolio: parseFloat(pct.toFixed(2)),
        current_cash: res.new_balance
      });
      setCoachMessage(coachRes.data.coach_message);
    } catch (err) {
      setCoachAlert({
        title: 'Trade Failed',
        message: err.response?.data?.detail || 'You do not own enough of this asset or server error.'
      });
    } finally {
      setIsTrading(false);
    }
  };

  const handleDismissCoach = () => {
    setCoachMessage(null);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen bg-[#fefcf4] flex items-center justify-center">
        <h2 className="text-3xl font-black uppercase tracking-tight animate-pulse">Scouting Player...</h2>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen bg-[#fefcf4] flex items-center justify-center flex-col gap-4">
        {coachAlert && <CoachAlert title={coachAlert.title} message={coachAlert.message} onDismiss={() => navigate('/')} />}
        <button onClick={() => navigate(-1)} className="bg-white border-4 border-black font-black uppercase text-sm px-4 py-2 shadow-[4px_4px_0px_0px_#000]">← Back</button>
      </div>
    );
  }

  const isPositive = asset.change >= 0;

  return (
    <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen bg-[#fefcf4] relative">
      {/* ── AI COACH MODAL (SERGEANT) ── */}
      {coachMessage && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-[#fad538] border-8 border-black shadow-[16px_16px_0px_0px_#000] max-w-xl w-full p-8" style={{ transform: 'rotate(-1deg)' }}>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 border-b-8 border-black pb-2 text-black">The Sergeant Says:</h2>
            <p className="text-2xl font-black leading-tight text-black mt-6 mb-8 uppercase">
              "{coachMessage}"
            </p>
            <button 
              onClick={handleDismissCoach}
              className="w-full bg-black text-white font-black uppercase py-4 text-xl border-4 border-black shadow-[4px_4px_0px_0px_#fff] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all cursor-pointer"
            >
              DISMISS AND RETURN
            </button>
          </div>
        </div>
      )}

      {coachAlert && <CoachAlert title={coachAlert.title} message={coachAlert.message} onDismiss={() => setCoachAlert(null)} />}

      {/* Back + Header */}
      <button onClick={() => navigate(-1)} className="bg-white border-4 border-black font-black uppercase text-sm px-4 py-2 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mb-6 cursor-pointer disabled:opacity-50" disabled={isTrading}>
        ← Back
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-[#65655f] tracking-widest flex items-center gap-2">
            <span>NSE: {ticker} | {asset.status}</span>
            {ownedQty > 0 && <span className="bg-[#fad538] text-black px-2 py-0.5 border-2 border-black">YOU OWN: {ownedQty}</span>}
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">{asset.name}</h1>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black">₹{asset.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className={`font-black text-lg ${isPositive ? 'text-green-700' : 'text-[#be2d06]'}`}>
            {isPositive ? '+' : ''}{asset.change}%
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <p className="text-[10px] font-black uppercase text-[#65655f] tracking-widest">Market Cap</p>
          <p className="text-lg font-black">{asset.marketCap}</p>
          <p className="text-xs font-bold text-[#685b9c] uppercase">Valuation Tiger</p>
        </div>
        <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <p className="text-[10px] font-black uppercase text-[#65655f] tracking-widest">PE Ratio</p>
          <p className="text-lg font-black">{asset.peRatio}</p>
          <p className="text-xs font-bold text-[#685b9c] uppercase">Premium Territory</p>
        </div>
        <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <p className="text-[10px] font-black uppercase text-[#65655f] tracking-widest">Vol (24h)</p>
          <p className="text-lg font-black">{asset.volume}</p>
          <p className="text-xs font-bold text-[#685b9c] uppercase">Heavy Trading</p>
        </div>
      </div>

      {/* Chart Area */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] mb-6">
        <div className="flex gap-2 p-3 border-b-4 border-black flex-wrap">
          {TIME_PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-4 py-1 border-4 border-black font-black text-xs uppercase transition-all ${
                selectedPeriod === p
                  ? 'bg-[#b6353a] text-white shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-white hover:bg-[#f5f4eb]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="h-64 p-3 relative">
          {candleLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              <span className="mt-3 font-black text-xs uppercase tracking-widest text-[#bab9b2]">Fetching Chart...</span>
            </div>
          ) : candleData.length > 0 ? (
            <DemoStockChart
              candles={candleData}
              ticker={ticker}
              demoMode={!isLiveMode}
              maxBars={30}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-[#81817a]">
              <span className="font-bold uppercase text-[#81817a] text-sm">No chart data available</span>
            </div>
          )}
        </div>
      </div>

      {/* Squad Activity */}
      <div className="bg-[#c3b4fc] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] mb-6 flex items-center gap-4" style={{ transform: 'rotate(-0.3deg)' }}>
        <Users size={24} />
        <div>
          <p className="font-black uppercase text-sm">Squad Activity</p>
          <p className="text-xs font-bold">{asset.squadHolding} Members Holding This Asset</p>
        </div>
      </div>

      {/* Trade Panel */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] p-6">
        <h3 className="font-black uppercase text-lg mb-4 border-b-4 border-black pb-3">Execute Trade</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest block mb-2">Quantity</label>
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} className="w-full bg-[#fefcf4] border-4 border-black p-3 font-bold focus:bg-[#fad538] focus:outline-none transition-colors" disabled={isTrading} />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest block mb-2">Assign Squad Role</label>
            <select value={squadRole} onChange={e => setSquadRole(e.target.value)} className="w-full bg-[#fefcf4] border-4 border-black p-3 font-bold focus:bg-[#fad538] focus:outline-none transition-colors appearance-none" disabled={isTrading}>
              <option value="">Select Role...</option>
              <option>Aggressive Opener</option>
              <option>Dependable No.3</option>
              <option>Sheet Anchor</option>
              <option>Power Hitter</option>
              <option>All-Rounder</option>
            </select>
          </div>
        </div>

        <div className="bg-[#fad538]/30 border-4 border-[#776300] p-3 mb-4">
          <p className="text-sm font-bold">Total Cost: <span className="font-black text-lg">₹{(asset.price * quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p>
        </div>

        <div className="flex gap-3">
          <button onClick={handleBuy} disabled={isTrading} className="flex-1 bg-[#b6353a] text-white border-4 border-black font-black uppercase py-3 shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 active:shadow-none active:translate-y-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {isTrading ? 'Awaiting Comm...' : 'Buy Asset'}
          </button>
          <button onClick={handleSell} disabled={isTrading} className="flex-1 bg-white border-4 border-black font-black uppercase py-3 shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-y-1 transition-all cursor-pointer text-[#65655f] hover:text-[#be2d06] disabled:opacity-50 disabled:cursor-not-allowed">
            {isTrading ? 'Awaiting Comm...' : 'Sell Asset'}
          </button>
        </div>
      </div>
    </div>
  );
}
