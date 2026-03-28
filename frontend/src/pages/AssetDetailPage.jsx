import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';
import CoachAlert from '../components/CoachAlert';
import { buyAsset, sellAsset, fetchAssetByTicker } from '../api';
import useUserStore from '../store/userStore';

const TIME_PERIODS = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

export default function AssetDetailPage() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const { updateBalance } = useUserStore();
  
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [quantity, setQuantity] = useState(1);
  const [coachAlert, setCoachAlert] = useState(null);
  const [squadRole, setSquadRole] = useState('');

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
    if (ticker) {
      getAsset();
    }
  }, [ticker]);

  const handleBuy = async () => {
    try {
      const res = await buyAsset(ticker, quantity);
      if (res.new_balance) updateBalance(res.new_balance);
      navigate('/');
    } catch (err) {
      setCoachAlert({
        title: 'Trade Failed', 
        message: err.response?.data?.detail || 'Insufficient balance or server error.'
      });
    }
  };

  const handleSell = async () => {
    try {
      const res = await sellAsset(ticker, quantity);
      if (res.new_balance) updateBalance(res.new_balance);
      navigate('/');
    } catch (err) {
      setCoachAlert({
        title: 'Trade Failed',
        message: err.response?.data?.detail || 'You do not own enough of this asset or server error.'
      });
    }
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
    <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen bg-[#fefcf4]">
      {coachAlert && <CoachAlert title={coachAlert.title} message={coachAlert.message} onDismiss={() => setCoachAlert(null)} />}

      {/* Back + Header */}
      <button onClick={() => navigate(-1)} className="bg-white border-4 border-black font-black uppercase text-sm px-4 py-2 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mb-6 cursor-pointer">
        ← Back
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-[#65655f] tracking-widest">NSE: {ticker} | {asset.status}</p>
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

      {/* Chart Area Placeholder */}
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
        <div className="h-48 flex items-center justify-center p-6">
          <div className="w-full h-full bg-gradient-to-r from-[#c3b4fc]/30 via-[#fad538]/20 to-[#ff7574]/30 border-2 border-dashed border-[#81817a] flex items-center justify-center">
            <span className="font-bold uppercase text-[#81817a] text-sm">Candlestick Chart • {selectedPeriod} View</span>
          </div>
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
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} className="w-full bg-[#fefcf4] border-4 border-black p-3 font-bold focus:bg-[#fad538] focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest block mb-2">Assign Squad Role</label>
            <select value={squadRole} onChange={e => setSquadRole(e.target.value)} className="w-full bg-[#fefcf4] border-4 border-black p-3 font-bold focus:bg-[#fad538] focus:outline-none transition-colors appearance-none">
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
          <button onClick={handleBuy} className="flex-1 bg-[#b6353a] text-white border-4 border-black font-black uppercase py-3 shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 active:shadow-none active:translate-y-1 transition-all cursor-pointer">
            Buy Asset
          </button>
          <button onClick={handleSell} className="flex-1 bg-white border-4 border-black font-black uppercase py-3 shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-y-1 transition-all cursor-pointer text-[#65655f] hover:text-[#be2d06]">
            Sell Asset
          </button>
        </div>
      </div>
    </div>
  );
}
