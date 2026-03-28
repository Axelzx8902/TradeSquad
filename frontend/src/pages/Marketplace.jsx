import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Lock, TrendingUp, TrendingDown, X, Clock, Radio, Wifi, WifiOff } from 'lucide-react';
import CoachAlert from '../components/CoachAlert';
import DemoStockChart from '../components/DemoStockChart';
import { buyAsset } from '../api';

const CATEGORIES = ['All', 'LARGE-CAP', 'MID-CAP', 'BONDS'];

export default function ScoutMarketplace() {
  const [query, setQuery]           = useState('');
  const [activeCategory, setActive] = useState('All');
  const [coachAlert, setCoachAlert] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [buyQty, setBuyQty]         = useState(1);
  const [scoutAssets, setScoutAssets] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [candleData, setCandleData] = useState([]);
  const [candleLoading, setCandleLoading] = useState(false);
  const [livePrice, setLivePrice] = useState(null);
  const [liveChange, setLiveChange] = useState(null);

  const [marketStatus, setMarketStatus]   = useState(null); // null = loading
  const [isLiveMode, setIsLiveMode] = useState(() => {
    return localStorage.getItem('tradesquad_data_mode') === 'live';
  });

  // Listen for toggle changes from ProfilePage
  useEffect(() => {
    const handleModeChange = (e) => {
      setIsLiveMode(e.detail?.live ?? false);
    };
    window.addEventListener('tradesquad_mode_change', handleModeChange);
    return () => window.removeEventListener('tradesquad_mode_change', handleModeChange);
  }, []);

  const mapAssets = useCallback((raw) => (raw || []).map((a) => ({
    id:       a.id,
    name:     a.asset_name || a.name,
    ticker:   a.ticker_symbol || a.symbol,
    price:    Number(a.current_price),
    category: a.asset_class_id || a.asset_class || (Number(a.current_price) > 2000 ? 'LARGE-CAP' : 'MID-CAP'),
    change:   Number(a.change_percent),
    pe:       (Math.random() * 30 + 10).toFixed(1) + 'x',
    mktCap:   '₹' + (Math.random() * 10 + 1).toFixed(1) + 'L Cr',
    vol:      Math.floor(Math.random() * 800 + 100) + 'K',
    sector:   'EQUITIES',
    locked:   !!a.required_lesson_id
  })), []);

  // Step 1: always check market status on mount and when mode changes
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    fetch(`${baseUrl}/v1/market/status`)
      .then(r => r.json())
      .then(setMarketStatus)
      .catch(() => setMarketStatus({ is_open: false, reason: 'Could not reach server' }));
  }, [isLiveMode]);

  // Step 2: wire data source based on mode
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

    if (isLiveMode) {
      // ─── LIVE MODE: REST call to yfinance endpoint ───────────────
      setLiveLoading(true);
      fetch(`${baseUrl}/v1/market/live`)
        .then(r => r.json())
        .then(data => {
          setScoutAssets(mapAssets(data.assets));
          // Update market status from live response too
          if (data.is_market_open !== undefined) {
            setMarketStatus(prev => ({ ...prev, is_open: data.is_market_open }));
          }
          setLiveLoading(false);
        })
        .catch(err => {
          console.error('Live data fetch error:', err);
          setLiveLoading(false);
          // Fallback: load demo data so the page isn't empty
          fetch(`${baseUrl}/v1/market/scout`)
            .then(r => r.json())
            .then(data => setScoutAssets(mapAssets(data.assets)))
            .catch(() => {});
        });

      // If market is open, poll every 30s for fresh prices
      const interval = setInterval(() => {
        fetch(`${baseUrl}/v1/market/live`)
          .then(r => r.json())
          .then(data => {
            setScoutAssets(mapAssets(data.assets));
            if (data.is_market_open !== undefined) {
              setMarketStatus(prev => ({ ...prev, is_open: data.is_market_open }));
            }
          })
          .catch(() => {});
      }, 30000);

      return () => clearInterval(interval);
    }

    // ─── DEMO MODE: persistent WebSocket with Weekend Simulator ─────────
    const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws/market/scout';
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setScoutAssets(mapAssets(data.assets));
      } catch (err) {
        console.error('Scout Parser Error:', err);
      }
    };

    ws.onerror = (err) => console.error('WebSocket error:', err);
    return () => ws.close();
  }, [isLiveMode, mapAssets]);


  const filtered = useMemo(() => {
    return scoutAssets.filter((a) => {
      const matchCat = activeCategory === 'All' || a.category === activeCategory;
      const q = query.toLowerCase();
      const matchQ = !q || a.name.toLowerCase().includes(q) || a.ticker.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, activeCategory, scoutAssets]);

  const groupedByCategory = useMemo(() => {
    const cats = activeCategory === 'All'
      ? ['LARGE-CAP', 'MID-CAP', 'BONDS']
      : [activeCategory];
    return cats.map((cat) => ({
      cat,
      assets: filtered.filter((a) => a.category === cat),
    })).filter((g) => g.assets.length > 0);
  }, [filtered, activeCategory]);

  const handleCardClick = (asset) => {
    if (asset.locked) {
      setCoachAlert({
        title: 'Asset Locked!',
        message: 'This asset class is gated behind a Dugout lesson. Complete the required module first to unlock trading.',
      });
      return;
    }
    setSelectedAsset(asset);
    setBuyQty(1);
    setCandleData([]);
    setLivePrice(null);
    setLiveChange(null);

    // Fetch candle data for this ticker
    if (asset.ticker) {
      setCandleLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      fetch(`${baseUrl}/v1/market/candles/${asset.ticker}`)
        .then(r => r.json())
        .then(data => {
          const candles = data.candles || [];
          setCandleData(candles);
          if (candles.length >= 2) {
            const lastClose = candles[candles.length - 1].close;
            const prevClose = candles[0].open;
            const changePct = ((lastClose - prevClose) / prevClose * 100).toFixed(2);
            setLivePrice(lastClose);
            setLiveChange(parseFloat(changePct));
          } else if (candles.length === 1) {
            setLivePrice(candles[0].close);
            setLiveChange(0);
          }
          setCandleLoading(false);
        })
        .catch(() => setCandleLoading(false));
    }
  };

  const handleBuy = async () => {
    try {
      const res = await buyAsset(selectedAsset.ticker, buyQty);
      setSuccessMsg(res.message);
      setSelectedAsset(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setCoachAlert({
        title: 'Trade Failed',
        message: err.response?.data?.detail || 'Could not complete the trade. Check your balance.',
      });
    }
  };

  const marketClosed = isLiveMode && marketStatus && !marketStatus.is_open;

  // Derive display price: prefer live candle data if loaded, else fallback to card data
  const modalPrice = livePrice ?? selectedAsset?.price ?? 0;
  const modalChange = liveChange ?? selectedAsset?.change ?? 0;

  return (
    <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen">
      {coachAlert && <CoachAlert title={coachAlert.title} message={coachAlert.message} onDismiss={() => setCoachAlert(null)} />}

      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-4 right-4 bg-[#fad538] border-4 border-black p-4 shadow-[8px_8px_0px_0px_#000] z-50 max-w-sm" style={{ transform: 'rotate(1deg)' }}>
          <p className="font-black uppercase text-sm">✅ {successMsg}</p>
        </div>
      )}

      {/* ── ASSET DETAIL MODAL ── */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#fefcf4] border-4 border-black shadow-[12px_12px_0px_0px_#000] w-full max-w-lg" style={{ transform: 'rotate(-0.4deg)' }}>
            {/* Modal header */}
            <div className="bg-[#c3b4fc] border-b-4 border-black px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#3d306f]">{selectedAsset.category} • {selectedAsset.sector}</p>
                <h2 className="text-2xl font-black uppercase leading-tight">{selectedAsset.name}</h2>
              </div>
              <button onClick={() => setSelectedAsset(null)} className="bg-white border-4 border-black p-2 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Price — uses live yfinance data when available */}
            <div className="px-5 py-4 border-b-4 border-black flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-[#65655f] tracking-widest flex items-center gap-1">
                  {livePrice ? '● LIVE' : 'LTP'}
                  <span className="text-[#bab9b2] ml-1">{selectedAsset.ticker}.NS</span>
                </p>
                <p className="text-4xl font-black">₹{modalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <span className={`font-black text-xl flex items-center gap-1 ${modalChange < 0 ? 'text-[#be2d06]' : 'text-green-700'}`}>
                {modalChange < 0 ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                {modalChange > 0 ? '+' : ''}{modalChange}%
              </span>
            </div>

            {/* Candlestick Chart — DemoStockChart component */}
            <div className="border-b-4 border-black p-3 bg-white h-52">
              {candleLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 font-black text-xs uppercase text-[#bab9b2] tracking-widest">Fetching chart...</span>
                </div>
              ) : (
                <DemoStockChart
                  candles={candleData}
                  ticker={selectedAsset.ticker}
                  demoMode={!isLiveMode}
                  maxBars={30}
                />
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-0 border-b-4 border-black">
              {[
                { label: 'P/E Ratio', val: selectedAsset.pe },
                { label: 'Mkt Cap', val: selectedAsset.mktCap },
                { label: 'Volume', val: selectedAsset.vol },
              ].map((s, i) => (
                <div key={i} className={`p-4 text-center ${i < 2 ? 'border-r-4 border-black' : ''}`}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#65655f]">{s.label}</p>
                  <p className="font-black text-base mt-1">{s.val}</p>
                </div>
              ))}
            </div>

            {/* Buy panel */}
            <div className="p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#65655f] mb-3">Quantity</p>
              <div className="flex gap-3 mb-4">
                {[1, 5, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setBuyQty(n)}
                    className={`flex-1 border-4 border-black font-black py-2 shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer text-sm ${buyQty === n ? 'bg-[#b6353a] text-white' : 'bg-white'}`}
                  >
                    {n}
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  value={buyQty}
                  onChange={(e) => setBuyQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 border-4 border-black font-black text-center p-2 bg-[#f5f4eb] focus:outline-none"
                />
              </div>
              <div className="bg-[#fad538] border-4 border-black p-3 flex justify-between items-center mb-4 shadow-[4px_4px_0px_0px_#000]">
                <p className="text-[10px] font-black uppercase tracking-widest">Total Cost</p>
                <p className="font-black text-lg">₹{(modalPrice * buyQty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <button
                onClick={handleBuy}
                className="w-full bg-[#b6353a] text-white border-4 border-black font-black uppercase py-4 shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 active:shadow-none active:translate-y-1 transition-all cursor-pointer text-base"
              >
                🏏 Scout Asset — Add to Playing XI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">The Scout Marketplace</h1>
          
          {/* Live / Demo Mode Badge */}
          {isLiveMode ? (
            <div className="flex items-center gap-2 bg-[#be2d06] text-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_#000] shrink-0" style={{ transform: 'rotate(1deg)' }}>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span className="font-black text-xs uppercase tracking-widest">Live — NSE via yfinance</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#44443f] text-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_#000] shrink-0" style={{ transform: 'rotate(1deg)' }}>
              <Wifi size={14} />
              <span className="font-black text-xs uppercase tracking-widest">Demo — Weekend Simulator</span>
            </div>
          )}
        </div>

        <div className="bg-[#b6353a] text-white border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000] mt-4 inline-block" style={{ transform: 'rotate(-0.5deg)' }}>
          <p className="font-bold text-sm uppercase">Master the art of media literacy. Can you tell the hype from the hard truth?</p>
        </div>
      </div>

      {/* ── MARKET CLOSED BANNER ── */}
      {marketClosed && (
        <div className="mb-6 bg-[#1b1b1b] text-white border-4 border-[#fad538] p-5 shadow-[6px_6px_0px_0px_#fad538] relative overflow-hidden" style={{ transform: 'rotate(-0.3deg)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#fad538] opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-[#fad538] text-black border-4 border-black p-3 shadow-[3px_3px_0px_0px_#000] shrink-0" style={{ transform: 'rotate(-2deg)' }}>
              <Clock size={28} strokeWidth={3} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-black text-lg uppercase tracking-tight">Market Closed</h3>
                <span className="bg-[#fad538] text-black text-[9px] font-black uppercase px-2 py-0.5 border-2 border-black tracking-widest">
                  {marketStatus?.is_open === false && marketStatus?.reason?.includes('Weekend') ? 'WEEKEND' : 'AFTER HOURS'}
                </span>
              </div>
              <p className="text-sm font-bold text-[#bab9b2]">
                {marketStatus?.reason || 'Markets open Mon-Fri 9:15 AM – 3:30 PM IST'}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#fad538] mt-2">
                📊 Showing last traded prices from NSE • {marketStatus?.current_ist || ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── LIVE LOADING STATE ── */}
      {liveLoading && (
        <div className="mb-6 bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_#000] flex items-center gap-4">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <div>
            <p className="font-black uppercase text-sm">Fetching live NSE data...</p>
            <p className="text-[10px] font-bold text-[#65655f] uppercase tracking-widest mt-1">Connecting to yfinance • This may take a few seconds</p>
          </div>
        </div>
      )}

      {/* ── SEARCH BAR ── */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#65655f]" />
        <input
          type="text"
          placeholder="Search stocks by name or ticker..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border-4 border-black font-bold pl-12 pr-4 py-3 bg-white shadow-[4px_4px_0px_0px_#000] focus:outline-none focus:shadow-[6px_6px_0px_0px_#000] transition-all text-sm uppercase placeholder:text-[#bab9b2] placeholder:normal-case"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-black text-[#65655f]">
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── CATEGORY FILTER TABS ── */}
      <div className="flex gap-0 mb-8 border-4 border-black w-fit shadow-[4px_4px_0px_0px_#000] overflow-hidden">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-5 py-2.5 font-black uppercase text-xs tracking-wider border-r-4 border-black last:border-r-0 transition-all cursor-pointer ${
              activeCategory === cat ? 'bg-[#b6353a] text-white' : 'bg-white hover:bg-[#f5f4eb]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── ASSET GROUPS ── */}
      {query && filtered.length === 0 && (
        <div className="bg-white border-4 border-black p-8 text-center shadow-[4px_4px_0px_0px_#000]">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-black uppercase text-lg">No stocks found</p>
          <p className="text-sm font-medium text-[#65655f] mt-1">Try a different name or ticker symbol</p>
        </div>
      )}

      {groupedByCategory.map(({ cat, assets }) => {
        const locked = assets[0]?.locked;
        return (
          <div key={cat} className="mb-10">
            {/* Category header */}
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-2xl font-black uppercase">{cat} Stocks{cat === 'Bonds' ? '' : ''}</h2>
              {locked && (
                <span className="text-xs font-black uppercase bg-[#be2d06] text-white border-2 border-black px-2 py-1 flex items-center gap-1">
                  <Lock size={10} /> Locked
                </span>
              )}
            </div>
            <p className="font-bold text-xs text-[#65655f] mb-4 uppercase">
              {cat === 'LARGE-CAP' ? 'Blue-chip stability for the long innings.' : cat === 'MID-CAP' ? 'High volatility, high reward. Unlock to enter.' : 'The defensive play. Low-risk, steady yields for a balanced portfolio.'}
            </p>

            {/* Asset card grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {assets.map((asset) => {
                const isNeg = asset.change < 0;
                const rot = (Math.random() * 1.2 - 0.6).toFixed(2);
                return (
                  <div
                    key={asset.id || asset.ticker}
                    onClick={() => handleCardClick(asset)}
                    className={`border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer bg-white ${locked ? 'opacity-75' : ''}`}
                    style={{ transform: `rotate(${rot}deg)` }}
                  >
                    {/* Tab header */}
                    <div className={`border-b-4 border-black px-4 py-2 flex justify-between items-center ${locked ? 'bg-[#e9e9de]' : isLiveMode ? 'bg-[#fce4e4]' : 'bg-[#c3b4fc]'}`}>
                      <span className="font-black text-xs uppercase tracking-wider">{asset.ticker}</span>
                      {locked
                        ? <span className="text-[10px] font-black bg-[#be2d06] text-white border border-black px-1.5 py-0.5 flex items-center gap-1"><Lock size={9} /> LOCKED</span>
                        : isLiveMode 
                          ? <span className="text-[10px] font-bold text-[#be2d06] uppercase flex items-center gap-1"><Radio size={9} /> NSE</span>
                          : <span className="text-[10px] font-bold text-[#65655f] uppercase">{asset.sector}</span>
                      }
                    </div>
                    {/* Body */}
                    <div className="p-4">
                      <h3 className="font-black text-sm uppercase leading-tight mb-3">{asset.name}</h3>
                      <p className="text-[9px] font-black uppercase text-[#65655f] tracking-widest mb-1">
                        {isLiveMode ? (marketClosed ? 'PREV CLOSE' : 'LTP') : 'LTP'}
                      </p>
                      <div className="flex justify-between items-end">
                        <p className="text-xl font-black">₹{asset.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        <span className={`font-black text-sm flex items-center gap-0.5 ${isNeg ? 'text-[#be2d06]' : 'text-green-700'}`}>
                          {isNeg ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                          {isNeg ? '' : '+'}{asset.change}%
                        </span>
                      </div>
                    </div>
                    {/* Action */}
                    <div className="border-t-4 border-black p-3">
                      <button
                        className={`w-full border-4 border-black font-black uppercase py-2 text-xs shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all ${
                          locked ? 'bg-[#e9e9de] text-[#65655f] cursor-not-allowed' : 'bg-[#b6353a] text-white cursor-pointer'
                        }`}
                      >
                        {locked ? '🔒 Unlock via Dugout' : 'Scout Asset'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
