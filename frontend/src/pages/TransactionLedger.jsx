import React, { useState } from 'react';
import { User, CheckSquare, XSquare, FileText, Download } from 'lucide-react';

const TRADES = [
  {
    id: 1,
    action: 'BUY',
    asset: 'RELIANCE',
    price: '₹2,845',
    date: '24 OCT 2023',
    coachCall: {
      correct: true,
      title: 'DISCIPLINED ENTRY',
      diagnostic: 'The RELIANCE trade was executed following strict technical signals. You resisted the impulse to enter early, ensuring a high-probability setup that minimized initial drawdown. This level of emotional regulation is the difference between a gambler and a professional.',
      impact: 'On a ₹1,00,000 position, this disciplined entry saved you ₹4,200 in slippage compared to an emotional chase.'
    }
  },
  {
    id: 2,
    action: 'SELL',
    asset: 'HDFCBANK',
    price: '₹1,442',
    date: '23 OCT 2023',
    coachCall: {
      correct: false,
      title: 'PREMATURE EXIT',
      diagnostic: 'You exited the HDFCBANK trade during a minor pullback instead of trusting the wider trend structure. Panic selling locks in suboptimal returns and disrupts the compounding process.',
      impact: 'Exiting early cost you approximately ₹14,500 in missed upward movement over the following 48 hours.'
    }
  },
  {
    id: 3,
    action: 'BUY',
    asset: 'TCS',
    price: '₹3,912',
    date: '22 OCT 2023',
    coachCall: null
  },
  {
    id: 4,
    action: 'BUY',
    asset: 'INFY',
    price: '₹1,675',
    date: '21 OCT 2023',
    coachCall: {
      correct: true,
      title: 'TEXTBOOK EXECUTION',
      diagnostic: 'Perfect execution aligning with the momentum breakout. Your sizing was appropriate and you adhered strictly to the playbook.',
      impact: 'This execution captured a rapid +8% gain within the trading session.'
    }
  },
  {
    id: 5,
    action: 'SELL',
    asset: 'ADANIENT',
    price: '₹3,120',
    date: '20 OCT 2023',
    coachCall: {
      correct: true,
      title: 'RISK MITIGATION',
      diagnostic: 'Swift recognition of weakening technicals. You cut the position early before the major breakdown occurred.',
      impact: 'Saved from a steep -12% drop that materialized shortly after your exit.'
    }
  }
];

export default function TransactionLedger() {
  const [selectedCall, setSelectedCall] = useState(null);

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
                  {/* Highlighting specific numbers just to match the vibe */}
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
        {/* Title Banner */}
        <div className="bg-[#b6353a] border-[8px] border-black px-8 py-5 shadow-[8px_8px_0px_0px_#000] inline-block" style={{ transform: 'rotate(-1.5deg)' }}>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white italic leading-none">The Ledger</h1>
        </div>

        {/* Balance Box */}
        <div className="bg-[#fefcf4] px-6 py-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#81817a] mb-1">Current Balance</p>
          <p className="text-3xl md:text-4xl font-black italic">₹84,200.50</p>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="flex border-[6px] border-black bg-white shadow-[6px_6px_0px_0px_#000] mb-8">
        <div className="flex-1 p-6 border-r-[6px] border-black">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#bab9b2] mb-3">Total Trades</p>
          <p className="text-3xl font-black">42</p>
        </div>
        <div className="flex-1 p-6 border-r-[6px] border-black text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#bab9b2] mb-3">Success Rate</p>
          <p className="text-3xl font-black text-[#8b7300]">78%</p>
        </div>
        <div className="flex-1 p-6 text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#bab9b2] mb-3">Coach Compliance</p>
          <p className="text-3xl font-black text-[#685b9c]">92%</p>
        </div>
      </div>

      {/* ── TRANSACTIONS TABLE ── */}
      <div className="border-[6px] border-black bg-white shadow-[6px_6px_0px_0px_#000] mb-8">
        {/* Table Header */}
        <div className="bg-black text-white px-6 py-4 flex items-center text-[10px] font-black uppercase tracking-widest">
          <div className="w-24">Action</div>
          <div className="flex-1">Asset</div>
          <div className="w-32 text-right border-black font-black">Price</div>
          <div className="w-32 text-center border-black">Date</div>
          <div className="w-40 text-right">Coach's Call</div>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col">
          {TRADES.map((t, idx) => (
            <div key={t.id} className={`flex items-center px-6 py-4 ${idx !== TRADES.length - 1 ? 'border-b-[6px] border-black' : ''}`}>
              <div className="w-24">
                <span className={`inline-block border-2 border-black text-[10px] font-black uppercase px-3 py-1 ${t.action === 'BUY' ? 'bg-[#fad538]' : 'bg-[#e57f7f] text-white'}`}>
                  {t.action}
                </span>
              </div>
              <div className="flex-1 font-black text-sm uppercase">{t.asset}</div>
              <div className="w-32 text-right font-black text-sm">{t.price}</div>
              <div className="w-32 text-center text-xs font-black text-[#bab9b2] uppercase tracking-widest">{t.date}</div>
              <div className="w-40 flex items-center justify-end gap-2">
                {t.coachCall ? (
                  <button 
                    onClick={() => setSelectedCall(t.coachCall)}
                    className="flex gap-1 items-center bg-[#f5f4eb] border-2 border-transparent hover:border-black p-1 transition-all cursor-pointer"
                  >
                    <User fill="black" size={16} />
                    <div className={t.coachCall.correct ? 'bg-green-500' : 'bg-[#b6353a]'}>
                      {t.coachCall.correct 
                        ? <CheckSquare className="text-white bg-green-500" size={18} strokeWidth={3} />
                        : <XSquare className="text-white bg-[#b6353a]" size={18} strokeWidth={3} />
                      }
                    </div>
                  </button>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#bab9b2]">— No Alert —</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Table Footer */}
        <div className="bg-[#f5f4eb] border-t-[6px] border-black px-6 py-4 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#81817a]">Showing 1-10 of 42 trades</span>
          <div className="flex gap-2">
            <button className="bg-white border-[4px] border-black px-4 py-2 text-[10px] font-black uppercase shadow-[3px_3px_0px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5">Prev</button>
            <button className="bg-[#fad538] border-[4px] border-black px-4 py-2 text-[10px] font-black uppercase shadow-[3px_3px_0px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5">Next</button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM PANELS ── */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Commentary Box */}
        <div className="flex-1 bg-[#c3b4fc] border-[6px] border-black shadow-[6px_6px_0px_0px_#000] p-6 relative" style={{ transform: 'rotate(-0.5deg)' }}>
          <h3 className="text-xl font-black italic uppercase text-[#3d306f] mb-4">Coach's Commentary</h3>
          <p className="text-sm font-bold leading-relaxed text-[#3d306f]">
            "Your timing on the <span className="bg-black text-white px-1 font-black">INFY</span> trade was impeccable. However, notice how ignoring the high-volatility whistle on <span className="bg-[#be2d06] text-white px-1 font-black">HDFCBANK</span> resulted in a 4% slip. Stick to the line!"
          </p>
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
