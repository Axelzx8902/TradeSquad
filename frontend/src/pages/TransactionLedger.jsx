import React, { useState, useEffect, useCallback } from 'react';
import { User, CheckSquare, XSquare, AlertTriangle, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';
import { fetchLedger } from '../api';
import useUserStore from '../store/userStore';

const PAGE_SIZE = 10;

export default function TransactionLedger() {
  const [selectedCall, setSelectedCall] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total_trades: 0, buy_count: 0, sell_count: 0, current_balance: 0 });
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total_trades: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  // Also pull balance from the global user store as a secondary source
  const { profile } = useUserStore();

  const loadPage = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLedger(p, PAGE_SIZE);
      setTransactions(data.transactions || []);
      setStats(data.stats || {});
      setPagination(data.pagination || {});
    } catch (err) {
      console.error('Ledger fetch error:', err);
      setError(err.response?.data?.detail || 'Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(page);
  }, [page, loadPage]);

  const currentBalance = stats.current_balance ?? profile?.virtual_balance ?? 0;
  const totalTrades = pagination.total_trades ?? stats.total_trades ?? 0;

  const handlePrev = () => { if (page > 1) setPage(p => p - 1); };
  const handleNext = () => { if (page < pagination.total_pages) setPage(p => p + 1); };

  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalTrades);

  return (
    <div className="p-6 md:ml-64 pb-24 md:pb-6 min-h-screen bg-[#fefcf4] max-w-5xl mx-auto">

      {/* ── COACH MODAL ── */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-[6px] border-black shadow-[12px_12px_0px_0px_#000] max-w-2xl w-full" style={{ transform: 'rotate(-0.5deg)' }}>
            <div className="bg-[#8b7300] border-b-[6px] border-black p-6">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white italic leading-none">
                Coach's Post-Match<br/>Analysis
              </h2>
            </div>
            <div className="p-8">
              <p className="font-black uppercase text-[10px] tracking-widest text-[#bab9b2] mb-1">Behavioral Diagnostic</p>
              <h3 className="text-3xl font-black uppercase text-[#8b7300] italic leading-none mb-6">
                {selectedCall.title}
              </h3>
              <p className="text-sm font-bold leading-relaxed mb-8">
                {selectedCall.diagnostic}
              </p>
              <div className="bg-[#fad538] border-[6px] border-black p-6 shadow-[6px_6px_0px_0px_#000] mb-8">
                <p className="font-black uppercase text-[10px] tracking-widest text-[#a88a00] mb-3">Real-World Impact</p>
                <p className="font-bold text-sm leading-relaxed text-black">
                  {selectedCall.impact.split(/(₹[\d,]+)/).map((part, i) =>
                    part.startsWith('₹')
                      ? <span key={i} className="bg-black text-white px-2 py-0.5 whitespace-nowrap">{part}</span>
                      : part
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="w-full bg-white border-[6px] border-black py-4 font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all active:bg-[#f5f4eb]"
              >
                Back To Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pt-4 gap-8 md:gap-4">
        <div className="bg-[#b6353a] border-[8px] border-black px-8 py-5 shadow-[8px_8px_0px_0px_#000] inline-block" style={{ transform: 'rotate(-1.5deg)' }}>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white italic leading-none">The Ledger</h1>
        </div>
        <div className="bg-[#fefcf4] px-6 py-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#81817a] mb-1">Current Balance</p>
          <p className="text-3xl md:text-4xl font-black italic">
            {loading && !currentBalance
              ? <span className="animate-pulse text-[#bab9b2]">Loading...</span>
              : `₹${Number(currentBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            }
          </p>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="flex border-[6px] border-black bg-white shadow-[6px_6px_0px_0px_#000] mb-8">
        <div className="flex-1 p-6 border-r-[6px] border-black">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#bab9b2] mb-3">Total Trades</p>
          <p className="text-3xl font-black">
            {loading ? <span className="animate-pulse text-[#bab9b2]">—</span> : totalTrades}
          </p>
        </div>
        <div className="flex-1 p-6 border-r-[6px] border-black text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#bab9b2] mb-3">Buys</p>
          <p className="text-3xl font-black text-green-700 flex items-center justify-center gap-2">
            {loading ? <span className="animate-pulse text-[#bab9b2]">—</span> : (
              <><TrendingUp size={20} strokeWidth={3} /> {stats.buy_count ?? 0}</>
            )}
          </p>
        </div>
        <div className="flex-1 p-6 text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#bab9b2] mb-3">Sells</p>
          <p className="text-3xl font-black text-[#b6353a] flex items-center justify-end gap-2">
            {loading ? <span className="animate-pulse text-[#bab9b2]">—</span> : (
              <><TrendingDown size={20} strokeWidth={3} /> {stats.sell_count ?? 0}</>
            )}
          </p>
        </div>
      </div>

      {/* ── ERROR STATE ── */}
      {error && (
        <div className="bg-[#be2d06] border-[6px] border-black p-6 shadow-[6px_6px_0px_0px_#000] mb-8 flex items-center gap-4 text-white">
          <AlertTriangle size={32} strokeWidth={3} />
          <div>
            <p className="font-black uppercase text-sm tracking-wide">Failed to Load Ledger</p>
            <p className="font-bold text-xs opacity-80 mt-1">{error}</p>
          </div>
          <button
            onClick={() => loadPage(page)}
            className="ml-auto bg-white text-black border-4 border-black px-4 py-2 font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── TRANSACTIONS TABLE ── */}
      <div className="border-[6px] border-black bg-white shadow-[6px_6px_0px_0px_#000] mb-8">
        {/* Table Header */}
        <div className="bg-black text-white px-6 py-4 flex items-center text-[10px] font-black uppercase tracking-widest">
          <div className="w-24">Action</div>
          <div className="flex-1">Asset</div>
          <div className="w-20 text-center">Qty</div>
          <div className="w-32 text-right">Price</div>
          <div className="w-32 text-center">Date</div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="flex flex-col">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex items-center px-6 py-4 animate-pulse ${i < 4 ? 'border-b-[6px] border-black' : ''}`}>
                <div className="w-24"><div className="h-6 w-14 bg-[#e9e9de] border-2 border-[#d0d0c8]" /></div>
                <div className="flex-1"><div className="h-4 w-28 bg-[#e9e9de]" /></div>
                <div className="w-20 flex justify-center"><div className="h-4 w-6 bg-[#e9e9de]" /></div>
                <div className="w-32 flex justify-end"><div className="h-4 w-20 bg-[#e9e9de]" /></div>
                <div className="w-32 flex justify-center"><div className="h-4 w-24 bg-[#e9e9de]" /></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <ShoppingCart size={48} strokeWidth={2} className="text-[#bab9b2] mb-4" />
            <h3 className="font-black uppercase text-xl mb-2">No Trades Yet</h3>
            <p className="text-sm font-bold text-[#81817a]">
              Your ledger is empty. Head to the marketplace to make your first trade!
            </p>
          </div>
        )}

        {/* Table Rows */}
        {!loading && transactions.length > 0 && (
          <div className="flex flex-col">
            {transactions.map((t, idx) => (
              <div
                key={t.id}
                className={`flex items-center px-6 py-4 ${idx !== transactions.length - 1 ? 'border-b-[6px] border-black' : ''}`}
              >
                {/* Action Badge */}
                <div className="w-24">
                  <span className={`inline-block border-2 border-black text-[10px] font-black uppercase px-3 py-1 ${t.action === 'BUY' ? 'bg-[#fad538] text-black' : 'bg-[#e57f7f] text-white'}`}>
                    {t.action}
                  </span>
                </div>

                {/* Asset Name */}
                <div className="flex-1">
                  <p className="font-black text-sm uppercase">{t.asset}</p>
                  <p className="text-[10px] font-bold text-[#81817a] uppercase tracking-wide mt-0.5 truncate max-w-[200px]">{t.asset_name}</p>
                </div>

                {/* Quantity */}
                <div className="w-20 text-center font-black text-sm text-[#65655f]">
                  ×{t.quantity}
                </div>

                {/* Price */}
                <div className="w-32 text-right font-black text-sm">
                  ₹{Number(t.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>

                {/* Date */}
                <div className="w-32 text-center text-xs font-black text-[#bab9b2] uppercase tracking-widest">
                  {t.date}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table Footer / Pagination */}
        <div className="bg-[#f5f4eb] border-t-[6px] border-black px-6 py-4 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#81817a]">
            {totalTrades === 0
              ? 'No trades found'
              : `Showing ${start}–${end} of ${totalTrades} trade${totalTrades !== 1 ? 's' : ''}`
            }
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={page <= 1 || loading}
              className="flex items-center gap-1 bg-white border-[4px] border-black px-4 py-2 text-[10px] font-black uppercase shadow-[3px_3px_0px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={12} strokeWidth={3} /> Prev
            </button>
            <button
              onClick={handleNext}
              disabled={page >= pagination.total_pages || loading}
              className="flex items-center gap-1 bg-[#fad538] border-[4px] border-black px-4 py-2 text-[10px] font-black uppercase shadow-[3px_3px_0px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight size={12} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM PANELS ── */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Commentary Box */}
        <div className="flex-1 bg-[#c3b4fc] border-[6px] border-black shadow-[6px_6px_0px_0px_#000] p-6 relative" style={{ transform: 'rotate(-0.5deg)' }}>
          <h3 className="text-xl font-black italic uppercase text-[#3d306f] mb-4">Coach's Commentary</h3>
          {totalTrades === 0 ? (
            <p className="text-sm font-bold leading-relaxed text-[#3d306f]">
              "Your ledger is blank — every champion starts somewhere. Make your first trade and the coach will start tracking your behavioral patterns."
            </p>
          ) : (
            <p className="text-sm font-bold leading-relaxed text-[#3d306f]">
              "You have made{' '}
              <span className="bg-black text-white px-1 font-black">{stats.buy_count ?? 0} buys</span>{' '}
              and{' '}
              <span className="bg-[#be2d06] text-white px-1 font-black">{stats.sell_count ?? 0} sells</span>{' '}
              so far. Keep reviewing your trade history to identify patterns and improve your batting average!"
            </p>
          )}
        </div>

        {/* Export Box */}
        <div className="flex-1 bg-white border-[6px] border-black shadow-[6px_6px_0px_0px_#000] p-6">
          <h3 className="text-sm font-black uppercase text-[#65655f] tracking-widest border-b-2 border-black pb-2 mb-6">Export Data</h3>
          <div className="flex gap-4">
            <button className="flex-1 bg-white border-[4px] border-black py-4 font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-y-1 active:translate-x-1 cursor-pointer">
              CSV Ledger
            </button>
            <button className="flex-1 bg-white border-[4px] border-black py-4 font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-y-1 active:translate-x-1 cursor-pointer">
              PDF Report
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
