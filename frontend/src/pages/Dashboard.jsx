import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import CoachAlert from '../components/CoachAlert';
import usePortfolioStore from '../store/portfolioStore';
import useUserStore from '../store/userStore';

export default function PlayingXIDashboard() {
  const [coachAlert, setCoachAlert] = useState(null);
  
  // Zustand State hooks
  const { portfolio, isLoading: portfolioLoading, error, fetchData } = usePortfolioStore();
  const { profile, fetchProfile } = useUserStore();

  useEffect(() => {
    fetchData();
    fetchProfile();
  }, [fetchData]);

  // Handle Neo-Brutalist Loading State
  if (portfolioLoading) {
    return (
      <div className="min-h-screen bg-[#fefcf4] flex items-center justify-center p-6 md:ml-64 font-sans">
        <div className="bg-[#fad538] border-[8px] border-black p-10 md:p-16 shadow-[12px_12px_0px_0px_#000] flex flex-col items-center transform transition-transform animate-pulse">
          <div className="w-20 h-20 border-[8px] border-black border-t-transparent border-solid rounded-full animate-spin mb-6"></div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-black text-center leading-none">Scanning<br/>The Pitch...</h2>
        </div>
      </div>
    );
  }

  // Handle Fetch Errors
  if (error) {
    return (
      <div className="min-h-screen bg-[#fefcf4] flex items-center justify-center p-6 md:ml-64 font-sans">
        <div className="bg-[#be2d06] border-[8px] border-black p-10 md:p-16 shadow-[12px_12px_0px_0px_#000] flex flex-col items-center">
          <AlertTriangle size={80} strokeWidth={3} color="white" className="mb-6" />
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">Umpire Disagrees</h2>
          <p className="text-xl font-black text-[#f5baba] text-center uppercase">{error}</p>
          <button onClick={() => fetchData()} className="mt-8 bg-white text-black border-[4px] border-black px-6 py-3 font-black uppercase hover:bg-black hover:text-white transition-colors text-xl">
            Signal Replay
          </button>
        </div>
      </div>
    );
  }

  const totalValue = portfolio.reduce((sum, s) => sum + ((s.price || 0) * (s.quantity || 1)), 0);

  return (
    <div className="p-6 md:ml-64 pb-32 md:pb-12 min-h-screen bg-[#fefcf4] font-sans">
      {coachAlert && (
        <CoachAlert
          title={coachAlert.title}
          message={coachAlert.message}
          onDismiss={() => setCoachAlert(null)}
          onProceed={() => setCoachAlert(null)}
        />
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-12 gap-6 max-w-[1400px] mx-auto pt-6">
        <div>
          <h1 className="text-5xl md:text-[5rem] font-black uppercase tracking-tighter leading-none text-black mb-2">My Playing XI</h1>
          <p className="text-[10px] md:text-sm font-black uppercase text-[#81817a] tracking-widest pl-1">Squad Strength Dashboard</p>
        </div>
        
        {/* Financial Blocks */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <div className="bg-white border-[6px] border-black p-5 shadow-[8px_8px_0px_0px_#000] min-w-[200px]">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#65655f] mb-2">Virtual Balance</p>
            <p className="text-3xl sm:text-4xl font-black text-black leading-none">₹{profile?.virtual_balance ? profile.virtual_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}</p>
          </div>
          <div className="bg-[#fad538] border-[6px] border-black p-5 shadow-[8px_8px_0px_0px_#000] min-w-[200px]">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#8b7300] mb-2">Portfolio Value</p>
            <p className="text-3xl sm:text-4xl font-black text-black leading-none">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {portfolio.length === 0 ? (
        <div className="w-full max-w-[1400px] mx-auto bg-white border-[6px] border-black p-12 text-center shadow-[8px_8px_0px_0px_#000]">
          <h2 className="text-3xl font-black text-black uppercase mb-4">Your dugout is empty</h2>
          <p className="text-xl text-[#81817a] font-black mb-8">Head to the marketplace to draft your first MVP asset.</p>
          <Link to="/scout" className="bg-black text-white px-8 py-4 font-black uppercase text-xl hover:bg-[#fad538] hover:text-black transition-colors border-[4px] border-black">
            Enter Marketplace
          </Link>
        </div>
      ) : (
        /* ── PLAYING XI GRID ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8 max-w-[1400px] mx-auto">
          {portfolio.map((asset) => {
            const isNeg = asset.change < 0;
            return (
              <Link
                to={`/asset/${asset.ticker}`}
                key={asset.id}
                className="bg-white border-[6px] border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all block overflow-hidden"
              >
                {/* Card Header Top */}
                <div className="bg-[#c3b4fc] border-b-[6px] border-black px-4 py-3 flex justify-between items-center h-14">
                  <span className="font-black text-xs uppercase tracking-widest text-black">{asset.ticker}</span>
                  <span className="text-[9px] font-black uppercase bg-[#fad538] border-[3px] border-black px-2 py-1 tracking-widest text-black whitespace-nowrap">
                    {asset.role}
                  </span>
                </div>
                
                {/* Card Body */}
                <div className="p-5 h-[110px] flex flex-col justify-between bg-white">
                  <h3 className="font-black text-sm uppercase text-[#44443f] tracking-tight truncate">{asset.name}</h3>
                  
                  <div className="flex justify-between items-end w-full">
                    <p className="text-[28px] font-black text-black leading-none uppercase">
                      ₹{asset.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    
                    {/* Line Chart & Indicator Mockup inside card */}
                    <div className="flex items-center gap-1.5 pb-1 shrink-0 ml-4">
                      <span className={`font-black text-base flex items-center gap-1 tracking-wider ${isNeg ? 'text-[#be2d06]' : 'text-green-600'}`}>
                        {isNeg ? <TrendingDown size={14} strokeWidth={4} /> : <TrendingUp size={14} strokeWidth={4} />}
                        {isNeg ? '' : '+'}{asset.change}%
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
