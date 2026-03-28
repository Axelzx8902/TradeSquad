import React from 'react';

const CONTENDERS = [
  { rank: 4, name: 'BOUNDARYBREAKER', badge: 'PRO CHALLENGER', pl: '+7.1%' },
  { rank: 5, name: 'MARKET_DEEPCOVER', badge: 'DARK HORSE', pl: '+6.8%' },
  { rank: 6, name: 'STRIKERATE_KING', badge: 'AGGRESSIVE PLAYER', pl: '+6.2%' },
  { rank: 7, name: 'YORKER_EXPERT', badge: 'TACTICAL WIZARD', pl: '+5.9%' }
];

export default function PointsTable() {
  return (
    <div className="md:ml-64 bg-[#fefcf4] min-h-screen font-sans pb-[150px] overflow-x-hidden">
      <div className="w-full max-w-5xl mx-auto p-4 md:p-6 flex flex-col items-center">
      
      {/* ── HEADER BANNER ── */}
      <div className="w-full mb-12 relative overflow-hidden">
        <div className="bg-black border-[4px] border-black p-8 pb-12 mt-4 ml-2 mr-2 z-10 relative">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#3d0000] transform skew-x-[-20deg] origin-bottom-right"></div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-4 relative z-20">
            7-Day Challenge:<br/>Mid-Cap Mania
          </h1>
          <div className="bg-[#8b7300] border-[2px] border-transparent text-[#1a1500] uppercase font-black tracking-widest text-[10px] px-3 py-1 inline-block relative z-20">
            Live Event
          </div>
        </div>
        <div className="bg-[#7c66c7] border-[4px] border-black py-2 px-6 flex items-center justify-end -mt-8 relative z-30 ml-2 mr-2">
          <p className="text-[9px] font-black uppercase text-white tracking-widest text-right">
            Time Remaining: 02D 14H 22M &nbsp;&nbsp;•&nbsp;&nbsp; Total Prize Pool 🌟
          </p>
        </div>
      </div>

      {/* ── PODIUM ── */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 w-full mb-16 px-4">
        
        {/* RANK #2 (Left) */}
        <div className="order-2 md:order-1 flex-1 max-w-[280px] bg-white border-[6px] border-[#e2e8f0] p-6 shadow-sm flex flex-col items-center relative transform translate-y-4">
          <div className="absolute -top-12 flex flex-col items-center">
            <div className="w-20 h-20 bg-[#2d4b5a] border-[4px] border-black overflow-hidden flex justify-center items-end text-4xl shadow-[2px_2px_0px_0px_#000]">
              🧝
            </div>
            <div className="bg-[#e9e9de] border-[2px] border-black px-2 mt-[-10px] z-10 text-[9px] font-black tracking-widest uppercase">
              Pro
            </div>
          </div>
          <div className="mt-8 text-center w-full">
            <h3 className="text-lg font-black uppercase italic tracking-tighter text-[#44443f]">GullyBoy_99</h3>
            <p className="text-xl font-black text-[#2a5d34] mb-3">+9.8% P&L</p>
            <hr className="border-t-2 border-dashed border-[#bab9b2] mb-3"/>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#bab9b2]">Current Rank</p>
            <p className="text-3xl font-black text-[#bab9b2]">#2</p>
          </div>
        </div>

        {/* RANK #1 (Center) */}
        <div className="order-1 md:order-2 flex-[1.2] max-w-[320px] bg-white border-[6px] border-[#fad538] p-8 shadow-[8px_8px_0px_0px_#000] flex flex-col items-center relative z-20 mb-8 md:mb-0">
          <div className="absolute -top-6 -left-6 bg-[#be2d06] text-white border-[4px] border-black px-4 py-1 font-black text-sm uppercase transform -rotate-[15deg] shadow-[4px_4px_0px_0px_#000] z-30">
            Leader
          </div>
          <div className="absolute -top-14 flex flex-col items-center">
            <div className="w-24 h-24 bg-[#2d4b5a] border-[4px] border-black overflow-hidden flex justify-center items-end text-5xl shadow-[4px_4px_0px_0px_#000]">
              🧑‍🎤
            </div>
            <div className="bg-[#8b7300] border-[3px] border-black px-3 mt-[-12px] z-10 text-[10px] font-black tracking-widest uppercase text-[#fefcf4]">
              Champion
            </div>
          </div>
          <div className="mt-10 text-center w-full">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">SkyHigh_Trader</h3>
            <p className="text-3xl font-black text-[#2a5d34] mb-4">+12.4% P&L</p>
            <hr className="border-t-2 border-dashed border-[#bab9b2] mb-4"/>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#a1a19a]">Current Rank</p>
            <p className="text-5xl font-black text-[#8b7300]">#1</p>
          </div>
        </div>

        {/* RANK #3 (Right) */}
        <div className="order-3 md:order-3 flex-1 max-w-[280px] bg-white border-[6px] border-[#fb923c] p-6 shadow-sm flex flex-col items-center relative transform translate-y-4">
          <div className="absolute -top-12 flex flex-col items-center">
            <div className="w-20 h-20 bg-[#2d4b5a] border-[4px] border-black overflow-hidden flex justify-center items-end text-4xl shadow-[2px_2px_0px_0px_#000]">
              🧝‍♂️
            </div>
            <div className="bg-[#fb923c] border-[2px] border-black px-2 mt-[-10px] z-10 text-[9px] font-black tracking-widest uppercase text-black">
              All-Rounder
            </div>
          </div>
          <div className="mt-8 text-center w-full">
            <h3 className="text-lg font-black uppercase italic tracking-tighter text-[#44443f]">SpinWizard_V2</h3>
            <p className="text-xl font-black text-[#2a5d34] mb-3">+8.2% P&L</p>
            <hr className="border-t-2 border-dashed border-[#bab9b2] mb-3"/>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#bab9b2]">Current Rank</p>
            <p className="text-3xl font-black text-[#fb923c]">#3</p>
          </div>
        </div>
      </div>

      {/* ── CONTENDERS LIST ── */}
      <div className="w-full flex-grow mx-auto mb-32">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-6 bg-[#be2d06]"></div>
          <h2 className="text-lg font-black italic tracking-widest uppercase text-[#81817a]">Contenders (Ranks 4-7)</h2>
        </div>

        <div className="space-y-4">
          {CONTENDERS.map((player) => (
            <div key={player.rank} className="bg-white border-[4px] border-black p-4 flex items-center shadow-[4px_4px_0px_0px_#000]">
              <div className="w-16 flex justify-center">
                <span className="text-3xl font-black italic text-black">#{player.rank}</span>
              </div>
              <div className="w-12 h-12 bg-black border-2 border-black flex justify-center items-center text-xl overflow-hidden shadow-sm shrink-0">
                🧔
              </div>
              <div className="ml-6 flex-1 min-w-0">
                <h3 className="font-black uppercase tracking-tighter text-base leading-tight truncate">{player.name}</h3>
                <p className="text-[8px] font-black tracking-widest uppercase text-[#81817a]">{player.badge}</p>
              </div>
              <div className="ml-4 bg-black border-2 border-black px-4 py-2 text-white">
                <span className="font-black text-sm tracking-wide">{player.pl}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* ── STICKY BULLETPROOF PERFORMANCE BANNER ── */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 z-40 px-4 md:px-8 bg-[#fefcf4] border-t-[6px] border-black pt-5 pb-5 w-[calc(100vw)] md:w-[calc(100vw-256px)]">
        <div className="max-w-5xl mx-auto flex justify-center items-end h-[100px] relative w-full">
          
          {/* Peeking Rank 11 - Pulled to extreme left of container, hidden on small screens */}
          <div className="absolute left-0 bottom-0 hidden lg:flex flex-col w-[200px] h-16 bg-white border-[4px] border-black opacity-50 hover:opacity-100 transition-opacity z-10">
             <div className="flex items-center h-full px-4 gap-3">
               <span className="text-2xl font-black italic text-[#bab9b2]">#11</span>
               <div className="flex-1 min-w-0">
                 <p className="text-[10px] font-black uppercase text-black">Duckout_Dan</p>
                 <p className="text-xs font-black text-[#2a5d34]">+4.1%</p>
               </div>
             </div>
          </div>

          {/* MAIN PERFORMANCE BLOCK - Centered rigidly via flex */}
          <div className="relative w-full max-w-[650px] bg-[#be2d06] border-[6px] border-black shadow-[6px_6px_0px_0px_#000] p-4 flex flex-col sm:flex-row items-center justify-between z-30 transform translate-y-2 mx-auto">
            <div className="absolute -top-3 left-6 bg-black text-white border-[2px] border-black px-3 py-0.5 text-[9px] font-black uppercase tracking-widest">
              Your Performance
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto mb-2 sm:mb-0">
              <div className="relative shrink-0">
                <span className="text-[3.5rem] md:text-6xl font-black italic text-white tracking-tighter drop-shadow-md leading-none">#12</span>
                <span className="absolute -bottom-1 -right-4 bg-[#fad538] text-black border-[3px] border-black text-[10px] font-black uppercase px-2 py-0.5 transform rotate-[-6deg] z-20">You</span>
              </div>
              <div className="pl-4">
                <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none mb-1">Trader_Pro_42</h3>
                <p className="text-[9px] tracking-widest uppercase font-black text-[#f5baba]">P&L Target: +5.0%</p>
              </div>
            </div>

            <div className="flex items-stretch gap-4 w-full sm:w-auto justify-end shrink-0">
              <div className="bg-white border-[4px] border-black px-4 py-2 flex flex-col justify-center items-center h-[52px]">
                <p className="text-[8px] font-black uppercase text-black tracking-widest mb-0.5">Current P&L</p>
                <p className="text-xl font-black text-black leading-none">+3.8%</p>
              </div>
              <button className="bg-[#fad538] text-black border-[4px] border-black font-black uppercase text-base px-6 shadow-[3px_3px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all hover:bg-white h-[52px]">
                Boost
              </button>
            </div>
          </div>

          {/* Peeking Rank 13 - Pulled to extreme right of container, hidden on small screens */}
          <div className="absolute right-0 bottom-0 hidden lg:flex flex-col w-[200px] h-16 bg-white border-[4px] border-black opacity-50 hover:opacity-100 transition-opacity z-10">
             <div className="flex items-center justify-end h-full px-4 gap-3 text-right">
               <div className="flex-1 min-w-0">
                 <p className="text-[10px] font-black uppercase text-black">Rear Guard</p>
               </div>
               <span className="text-2xl font-black italic text-[#bab9b2]">#13</span>
             </div>
          </div>
          
        </div>
      </div>

    </div>
  );
}
